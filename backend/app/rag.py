import hashlib
import io
import json
import re
import threading
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
import faiss
import numpy as np
from fastapi import HTTPException
from pypdf import PdfReader
from . import config, db

LOCK = threading.RLock()

@lru_cache(maxsize=1)
def embedding_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(config.MODEL,device='cpu',cache_folder=str(config.MODEL_CACHE),local_files_only=True)

def embed(texts):
    try: return np.asarray(embedding_model().encode(texts,normalize_embeddings=True,show_progress_bar=False,batch_size=32),dtype='float32')
    except Exception as exc:
        raise HTTPException(503,'The local embedding model is unavailable. Download it using the setup command in README, then retry indexing.') from exc

def extract(filename,raw):
    suffix=Path(filename).suffix.lower()
    if suffix not in ('.pdf','.txt','.md'): raise HTTPException(415,'Upload a PDF, TXT, or Markdown document.')
    if not raw or len(raw)>config.MAX_UPLOAD: raise HTTPException(413,'The document must be non-empty and no larger than 20 MB.')
    try:
        if suffix=='.pdf':
            if not raw.startswith(b'%PDF-'): raise ValueError('not a PDF')
            pdf=PdfReader(io.BytesIO(raw))
            if pdf.is_encrypted: raise HTTPException(422,'Unlock this PDF before uploading it.')
            if len(pdf.pages)>config.MAX_PAGES: raise HTTPException(413,'This PDF exceeds the 1,500-page limit. Split it into volumes.')
            pages=[(i+1,p.extract_text() or '') for i,p in enumerate(pdf.pages)]
        else: pages=[(None,raw.decode('utf-8-sig'))]
    except HTTPException: raise
    except Exception: raise HTTPException(422,'This document could not be read. Use a valid text-based PDF or UTF-8 TXT/MD file.')
    if not any(t.strip() for _,t in pages): raise HTTPException(422,'No readable text was found. Scanned PDFs need OCR before uploading.')
    if sum(len(t) for _,t in pages)>4_000_000: raise HTTPException(413,'Extracted text is too large. Split the document into smaller files.')
    return pages

def chunks_from_pages(pages):
    output=[]
    chapter=section=subsection=None
    for page,text in pages:
        buffer=[]
        def flush():
            value='\n'.join(buffer).strip()
            if value: output.append({'content':value,'page':page,'chapter':chapter,'section':section,'subsection':subsection})
            buffer.clear()
        for line in text.replace('\x00','').splitlines():
            line=re.sub(r'[ \t]+',' ',line).strip()
            heading = re.match(r'^(#{1,3})\s+(.+)$',line)
            numbered = re.match(r'^(Chapter\s+\d+\b.*|\d+(?:\.\d+){0,2}\s+\S.*)$',line,re.I)
            if (heading or numbered) and len(line)<160:
                flush()
                if heading:
                    depth=len(heading[1]); title=heading[2]
                    if depth==1: chapter=title; section=subsection=None
                    elif depth==2: section=title; subsection=None
                    else: subsection=title
                else: section=line
            if not line: continue
            # ponytail: bounded character chunks preserve page/headings; add layout-aware parsing if source quality demands it.
            for start in range(0,len(line),1200):
                part=line[start:start+1200]
                if sum(map(len,buffer))+len(part)>1600: flush()
                buffer.append(part)
        flush()
    return output

def validate_scope(course_id,document_ids):
    for ident in document_ids:
        if not db.one('SELECT id FROM documents WHERE id=? AND course_id=?',(ident,course_id)): raise HTTPException(404,'Document not found in this course.')

def rebuild(course_id):
    with LOCK:
        chunks=db.rows('SELECT id,embedding FROM chunks WHERE course_id=? AND embedding IS NOT NULL ORDER BY id',(course_id,))
        target=config.DATA/'indexes'/course_id
        target.mkdir(parents=True,exist_ok=True)
        if not chunks:
            for name in ('vectors.faiss','metadata.json'):(target/name).unlink(missing_ok=True)
            return
        vectors=np.vstack([np.frombuffer(c['embedding'],dtype='float32') for c in chunks])
        index=faiss.IndexFlatIP(vectors.shape[1]); index.add(vectors)
        faiss.write_index(index,str(target/'vectors.tmp'))
        (target/'vectors.tmp').replace(target/'vectors.faiss')
        (target/'metadata.tmp').write_text(db.dump({'model':config.MODEL,'ids':[c['id'] for c in chunks]}),encoding='utf-8')
        (target/'metadata.tmp').replace(target/'metadata.json')

def ingest(course_id,filename,raw,content_type='uploaded',lesson_id=None):
    pages=extract(filename,raw)
    parsed=chunks_from_pages(pages)
    if not parsed: raise HTTPException(422,'The document has no indexable text.')
    vectors=embed([p['content'] for p in parsed])
    ident=db.uid(); safe=re.sub(r'[^\w. -]','_',Path(filename.replace('\\','/')).name)[:150] or 'document.txt'
    path=config.DATA/'uploads'/(ident+Path(safe).suffix.lower()); path.write_bytes(raw)
    lesson=db.one('SELECT module_id FROM lessons WHERE id=? AND course_id=?',(lesson_id,course_id)) if lesson_id else None
    try:
        with LOCK,db.connect() as c:
            c.execute('INSERT INTO documents(id,course_id,source_name,path,page_count,content_type,status,created_at) VALUES(?,?,?,?,?,?,?,?)',(ident,course_id,safe,str(path),len(pages),content_type,'Indexed',db.now()))
            for p,v in zip(parsed,vectors):
                c.execute('INSERT INTO chunks(id,course_id,module_id,lesson_id,document_id,source_name,page,chapter,section,subsection,content,content_type,created_at,embedding) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(db.uid(),course_id,lesson['module_id'] if lesson else None,lesson_id,ident,safe,p['page'],p['chapter'],p['section'],p['subsection'],p['content'],content_type,db.now(),v.tobytes()))
        rebuild(course_id)
    except Exception:
        db.execute('DELETE FROM documents WHERE id=?',(ident,));path.unlink(missing_ok=True)
        raise
    return db.one('SELECT d.*, (SELECT count(*) FROM chunks c WHERE c.document_id=d.id) chunk_count FROM documents d WHERE id=?',(ident,))

def reindex(document):
    parsed=chunks_from_pages(extract(document['source_name'],Path(document['path']).read_bytes()))
    vectors=embed([p['content'] for p in parsed])
    previous=db.rows('SELECT * FROM chunks WHERE document_id=?',(document['id'],))
    original=defaultdict(list)
    for p in previous:original[(p['page'],p['content'])].append(p)
    with LOCK,db.connect() as c:
        c.execute('DELETE FROM chunks WHERE document_id=?',(document['id'],))
        for p,v in zip(parsed,vectors):
            matching=original[(p['page'],p['content'])]
            old=matching.pop(0) if matching else {}
            c.execute('INSERT INTO chunks(id,course_id,module_id,lesson_id,document_id,source_name,page,chapter,section,subsection,content,content_type,created_at,version,embedding) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(old.get('id',db.uid()),document['course_id'],old.get('module_id'),old.get('lesson_id'),document['id'],document['source_name'],p['page'],p['chapter'],p['section'],p['subsection'],p['content'],document['content_type'],db.now(),document['version']+1,v.tobytes()))
        c.execute('UPDATE documents SET version=version+1,status=? WHERE id=?',('Indexed',document['id']))
    rebuild(document['course_id'])

def remove(document):
    with LOCK:
        db.execute('DELETE FROM documents WHERE id=?',(document['id'],))
        rebuild(document['course_id'])
    Path(document['path']).unlink(missing_ok=True)

def source(c):
    result={k:c.get(k) for k in ('id','document_id','source_name','page','chapter','section','subsection','content_type','course_id','module_id','lesson_id')} | {'excerpt':c['content']}
    context=db.one('SELECT c.title course_title,m.title module_title,l.title lesson_title,l.id linked_lesson_id FROM courses c LEFT JOIN lessons l ON l.course_id=c.id AND (l.id=? OR EXISTS (SELECT 1 FROM json_each(l.sources) s WHERE json_extract(s.value,\'$.id\')=?)) LEFT JOIN modules m ON m.id=l.module_id WHERE c.id=? LIMIT 1',(c.get('lesson_id'),c['id'],c['course_id']))
    return result | (context or {})

def retrieve(course_id,query,document_ids=None,completed_only=False,limit=8):
    document_ids=document_ids or [];validate_scope(course_id,document_ids)
    sql='SELECT * FROM chunks WHERE course_id=? AND embedding IS NOT NULL'; args=[course_id]
    if document_ids: sql+=' AND document_id IN ('+','.join('?' for _ in document_ids)+')';args+=document_ids
    if completed_only:
        sql+=" AND (content_type='note' OR EXISTS (SELECT 1 FROM lessons l,json_each(l.sources) s WHERE l.course_id=? AND l.studied_at IS NOT NULL AND json_extract(s.value,'$.id')=chunks.id))"
        args.append(course_id)
    allowed=db.rows(sql+' ORDER BY id',args)
    if not allowed:return []
    q=embed([query])
    with LOCK:
        if not document_ids and not completed_only:
            target=config.DATA/'indexes'/course_id
            try:
                meta=json.loads((target/'metadata.json').read_text())
                if meta['model']!=config.MODEL: raise HTTPException(409,'The embedding model changed. Re-index every course document before searching.')
                if meta['ids']!=[c['id'] for c in allowed]:raise ValueError('stale')
                index=faiss.read_index(str(target/'vectors.faiss'))
                if index.ntotal!=len(allowed):raise ValueError('stale')
            except HTTPException:raise
            except Exception:
                rebuild(course_id);index=faiss.read_index(str(target/'vectors.faiss'))
        else:
            # Filtering BEFORE vector search prevents both course and selected-document leakage.
            vectors=np.vstack([np.frombuffer(c['embedding'],dtype='float32') for c in allowed])
            index=faiss.IndexFlatIP(vectors.shape[1]);index.add(vectors)
        if index.d!=q.shape[1]: raise HTTPException(409,'Re-index documents with the configured embedding model.')
        scores,positions=index.search(q,min(limit,len(allowed)))
    return [source(allowed[int(i)])|{'similarity':round(float(score),4)} for score,i in zip(scores[0],positions[0]) if i>=0 and score>=0.25]

def outline_context(course_id,document_ids=None):
    document_ids=document_ids or [];validate_scope(course_id,document_ids)
    sql='SELECT * FROM chunks WHERE course_id=?';args=[course_id]
    if document_ids:sql+=' AND document_id IN ('+','.join('?' for _ in document_ids)+')';args+=document_ids
    chunks=db.rows(sql+' ORDER BY document_id,page,created_at,id',args)
    # Sample across the full document, not just its opening pages; retain all discovered headings within a bounded budget.
    headings=list(dict.fromkeys(h for c in chunks for h in (c['chapter'],c['section'],c['subsection']) if h))
    sampled=chunks if len(chunks)<=24 else [chunks[int(i)] for i in np.linspace(0,len(chunks)-1,24)]
    evidence=[];budget=config.CONTEXT_CHARS
    for c in sampled:
        s=source(c);s['excerpt']=s['excerpt'][:900]
        if len(s['excerpt'])>budget:break
        evidence.append(s);budget-=len(s['excerpt'])
    return {'headings':headings[:180],'sources':evidence,'total_chunks':len(chunks)}
