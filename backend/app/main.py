import hashlib
import logging
import time
from collections import defaultdict,deque
from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from fastapi import FastAPI,Depends,HTTPException,Request,Response,UploadFile,File,Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse,JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool
from . import config,db,security,learning,rag,ai,chat,documents
from .schemas import *

log=logging.getLogger('studyforge')
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app):
    db.init();security.cipher()
    yield

app=FastAPI(title='StudyForge API',version='1.0.0',lifespan=lifespan,docs_url=None if config.PRODUCTION else '/api/docs')
app.add_middleware(CORSMiddleware,allow_origins=config.ORIGINS,allow_credentials=True,allow_methods=['GET','POST','PUT','PATCH','DELETE'],allow_headers=['Content-Type'])
auth_calls=defaultdict(deque)

@app.middleware('http')
async def protection(request,call_next):
    origin=request.headers.get('origin')
    if request.url.path.startswith('/api') and request.method not in ('GET','HEAD','OPTIONS'):
        if origin and origin not in config.ORIGINS:return JSONResponse({'detail':'This origin is not allowed.'},status_code=403)
        if request.headers.get('sec-fetch-site')=='cross-site':return JSONResponse({'detail':'Cross-site requests are not allowed.'},status_code=403)
        try:
            if int(request.headers.get('content-length','0'))>config.MAX_UPLOAD+65536:return JSONResponse({'detail':'Request exceeds the 20 MB upload limit.'},status_code=413)
        except ValueError:return JSONResponse({'detail':'Invalid request size.'},status_code=400)
    if request.url.path in ('/api/auth/login','/api/auth/register'):
        key=request.client.host if request.client else 'unknown';calls=auth_calls[key];now=time.time()
        while calls and calls[0]<now-60:calls.popleft()
        if len(calls)>=12:return JSONResponse({'detail':'Too many sign-in attempts. Wait a minute.'},status_code=429)
        calls.append(now)
    response=await call_next(request)
    response.headers['X-Content-Type-Options']='nosniff'
    response.headers['Referrer-Policy']='same-origin'
    response.headers['X-Frame-Options']='DENY'
    if request.url.path.startswith('/api'):response.headers['Cache-Control']='no-store'
    if config.PRODUCTION:response.headers['Strict-Transport-Security']='max-age=31536000; includeSubDomains'
    return response

@app.exception_handler(Exception)
async def failure(request,exc):
    log.exception('Request failed: %s',request.url.path,exc_info=exc)
    return JSONResponse({'detail':'StudyForge could not complete this request. Your saved work is safe. Please retry.'},status_code=500)

User=Depends(security.current_user)

@app.get('/api/health',response_model=HealthOutput)
def health():
    db.one('SELECT 1 ok')
    return {'status':'ok','database':'connected','research_available':False}

@app.post('/api/auth/register',status_code=201,response_model=UserOutput)
def register(data:Credentials,response:Response):
    user=security.register(data);security.session(user['id'],response);return user
@app.post('/api/auth/login',response_model=UserOutput)
def login(data:Credentials,response:Response):
    user=security.login(data);security.session(user['id'],response);return user
@app.get('/api/auth/me',response_model=UserOutput)
def me(user=User):return user
@app.post('/api/auth/logout')
def logout(request:Request,response:Response):
    db.execute('DELETE FROM sessions WHERE token=?',(hashlib.sha256(request.cookies.get('studyforge_session','').encode()).hexdigest(),))
    response.delete_cookie('studyforge_session',path='/');return {'ok':True}

@app.get('/api/settings',response_model=SettingsOutput)
def get_settings(user=User):return security.settings(user['id'])
@app.put('/api/settings',response_model=SettingsOutput)
def put_settings(data:SettingsInput,user=User):
    result=security.save_settings(user['id'],data)
    for l in db.rows('SELECT l.id FROM lessons l JOIN courses c ON c.id=l.course_id WHERE c.user_id=?',(user['id'],)):learning.recalculate(l['id'])
    return result
@app.post('/api/settings/test-ai')
def test_ai(user=User):
    ai.provider_for(user['id']).generate([{'role':'user','content':'Reply with the single word OK.'}]);return {'ok':True,'message':'Your AI provider is connected.'}

@app.get('/api/courses',response_model=list[CourseOutput])
def courses(user=User):
    return db.rows('SELECT c.*, (SELECT count(*) FROM lessons l WHERE l.course_id=c.id) lesson_count,(SELECT count(*) FROM lessons l WHERE l.course_id=c.id AND l.completed=1) completed_count FROM courses c WHERE c.user_id=? ORDER BY created_at DESC',(user['id'],))
@app.post('/api/courses',status_code=201,response_model=CourseOutput)
def new_course(data:CourseInput,user=User):return learning.create_course(user['id'],data)
@app.put('/api/courses/{cid}',response_model=CourseOutput)
def update_course(cid:str,data:CourseInput,user=User):
    security.require_course(cid,user['id'])
    db.execute('UPDATE courses SET title=?,goal=?,level=?,style=?,weeks=?,daily_minutes=?,availability=?,revision_day=? WHERE id=?',(data.title,data.goal,data.level,data.style,data.weeks,data.daily_minutes,db.dump(data.availability),data.revision_day,cid))
    return security.require_course(cid,user['id'])
@app.delete('/api/courses/{cid}')
def delete_course(cid:str,user=User):
    security.require_course(cid,user['id'])
    paths=db.rows('SELECT path FROM documents WHERE course_id=?',(cid,))+db.rows('SELECT path,markdown_path FROM generated_files WHERE course_id=?',(cid,))
    db.execute('DELETE FROM courses WHERE id=?',(cid,));rag.rebuild(cid)
    for row in paths:
        for p in row.values():Path(p).unlink(missing_ok=True)
    return {'ok':True}
@app.get('/api/courses/{cid}/curriculum')
def get_curriculum(cid:str,user=User):security.require_course(cid,user['id']);return learning.curriculum(cid)
@app.put('/api/courses/{cid}/curriculum')
def set_curriculum(cid:str,data:CurriculumInput,user=User):security.require_course(cid,user['id']);return learning.save_curriculum(cid,data)
@app.post('/api/courses/{cid}/curriculum/propose')
def propose(cid:str,data:GenerationInput,user=User):return learning.propose_curriculum(security.require_course(cid,user['id']),user['id'],data.document_ids,data.instruction)

@app.get('/api/lessons/{lid}')
def get_lesson(lid:str,user=User):return security.owned('lessons',lid,user['id'])
@app.post('/api/lessons/{lid}/generate')
def generate_lesson(lid:str,data:GenerationInput,user=User):return learning.lesson_content(security.owned('lessons',lid,user['id']),user['id'],data.instruction,data.document_ids)
@app.post('/api/lessons/{lid}/study')
def study(lid:str,user=User):
    lesson=security.owned('lessons',lid,user['id'])
    if not lesson['content']:raise HTTPException(409,'Generate or load the lesson before marking it studied.')
    db.execute('UPDATE lessons SET studied_at=coalesce(studied_at,?) WHERE id=?',(db.now(),lid));return {'ok':True}
@app.post('/api/lessons/{lid}/feedback')
def lesson_feedback(lid:str,data:FeedbackInput,user=User):
    lesson=security.owned('lessons',lid,user['id'])
    if not lesson['content']:raise HTTPException(409,'Open the lesson content first.')
    return learning.feedback(lesson,data.response)

@app.get('/api/courses/{cid}/schedule')
def schedule(cid:str,user=User):security.require_course(cid,user['id']);return db.rows('SELECT * FROM blocks WHERE course_id=? ORDER BY date,position',(cid,))
@app.post('/api/courses/{cid}/schedule')
def new_schedule(cid:str,data:ScheduleInput,user=User):return learning.make_schedule(security.require_course(cid,user['id']),data.start)
@app.put('/api/blocks/{bid}')
def update_block(bid:str,data:BlockInput,user=User):
    block=security.owned('blocks',bid,user['id']);course=security.require_course(block['course_id'],user['id'])
    used=db.one('SELECT coalesce(sum(minutes),0) total FROM blocks WHERE course_id=? AND date=? AND id!=?',(course['id'],data.date.isoformat(),bid))['total']
    if used+data.minutes>course['daily_minutes']:raise HTTPException(409,'This exceeds your daily study time. Choose another date or adjust course availability.')
    db.execute('UPDATE blocks SET date=?,title=?,minutes=?,completed=? WHERE id=?',(data.date.isoformat(),data.title,data.minutes,int(data.completed),bid));return {'ok':True}

@app.get('/api/tasks')
def tasks(user=User):return db.rows('SELECT * FROM tasks WHERE user_id=? ORDER BY due_date,created_at',(user['id'],))
@app.post('/api/tasks',status_code=201)
def new_task(data:TaskInput,user=User):
    if data.course_id:security.require_course(data.course_id,user['id'])
    ident=db.uid();db.execute('INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?)',(ident,user['id'],data.course_id,data.title,data.description,data.due_date.isoformat() if data.due_date else None,data.priority,data.minutes,data.status,db.now()));return db.one('SELECT * FROM tasks WHERE id=?',(ident,))
@app.put('/api/tasks/{tid}')
def update_task(tid:str,data:TaskInput,user=User):
    if data.course_id:security.require_course(data.course_id,user['id'])
    if not db.one('SELECT id FROM tasks WHERE id=? AND user_id=?',(tid,user['id'])):raise HTTPException(404,'Task not found.')
    db.execute('UPDATE tasks SET course_id=?,title=?,description=?,due_date=?,priority=?,minutes=?,status=? WHERE id=?',(data.course_id,data.title,data.description,data.due_date.isoformat() if data.due_date else None,data.priority,data.minutes,data.status,tid));return {'ok':True}
@app.delete('/api/tasks/{tid}')
def delete_task(tid:str,user=User):db.execute('DELETE FROM tasks WHERE id=? AND user_id=?',(tid,user['id']));return {'ok':True}

@app.get('/api/courses/{cid}/documents',response_model=list[DocumentOutput])
def document_list(cid:str,user=User):
    security.require_course(cid,user['id']);return db.rows('SELECT d.id,d.course_id,d.source_name,d.page_count,d.content_type,d.status,d.created_at,d.version,(SELECT count(*) FROM chunks c WHERE c.document_id=d.id) chunk_count FROM documents d WHERE course_id=? ORDER BY created_at DESC',(cid,))
@app.post('/api/courses/{cid}/documents',status_code=201,response_model=DocumentOutput)
async def upload(cid:str,file:UploadFile=File(...),user=User):
    security.require_course(cid,user['id']);raw=await file.read(config.MAX_UPLOAD+1);await file.close()
    result=await run_in_threadpool(rag.ingest,cid,file.filename or 'document',raw)
    result.pop('path',None);return result
@app.delete('/api/documents/{did}')
def delete_document(did:str,user=User):rag.remove(security.owned('documents',did,user['id']));return {'ok':True}
@app.post('/api/documents/{did}/reindex')
def index_document(did:str,user=User):rag.reindex(security.owned('documents',did,user['id']));return {'ok':True}
@app.put('/api/documents/{did}/course')
def move_document(did:str,course_id:str=Body(embed=True),user=User):
    doc=security.owned('documents',did,user['id']);security.require_course(course_id,user['id'])
    if doc['content_type']=='note':raise HTTPException(409,'Lesson notes stay with their original course.')
    with db.connect() as c:
        c.execute('UPDATE documents SET course_id=? WHERE id=?',(course_id,did))
        c.execute('UPDATE chunks SET course_id=?,module_id=NULL,lesson_id=NULL WHERE document_id=?',(course_id,did))
        c.execute('DELETE FROM chat_attachments WHERE document_id=?',(did,))
    rag.rebuild(doc['course_id']);rag.rebuild(course_id);return {'ok':True}
@app.get('/api/documents/{did}/download')
def original_document(did:str,user=User):
    d=security.owned('documents',did,user['id']);return FileResponse(d['path'],filename=d['source_name'])
@app.get('/api/documents/{did}/chunks')
def chunks(did:str,user=User):
    security.owned('documents',did,user['id']);return db.rows('SELECT id,source_name,page,chapter,section,subsection,content,content_type FROM chunks WHERE document_id=? ORDER BY page,created_at LIMIT 150',(did,))
@app.post('/api/courses/{cid}/rag',response_model=AnswerOutput)
def ask(cid:str,data:AskInput,user=User):security.require_course(cid,user['id']);return chat.answer(cid,user['id'],data.query,data.document_ids,data.completed_only)

@app.get('/api/lessons/{lid}/notes')
def notes(lid:str,user=User):security.owned('lessons',lid,user['id']);return db.rows('SELECT * FROM notes WHERE lesson_id=? ORDER BY created_at',(lid,))
@app.post('/api/lessons/{lid}/notes',status_code=201)
def new_note(lid:str,data:NoteInput,user=User):
    lesson=security.owned('lessons',lid,user['id']);ident=db.uid();did=None
    if data.indexed:did=rag.ingest(lesson['course_id'],lesson['title']+' note.txt',data.content.encode(),'note',lid)['id']
    db.execute('INSERT INTO notes VALUES(?,?,?,?,?,?,?)',(ident,lid,data.category,data.content,int(data.indexed),did,db.now()));return {'id':ident}
@app.delete('/api/notes/{nid}')
def delete_note(nid:str,user=User):
    note=db.one('SELECT * FROM notes WHERE id=?',(nid,))
    if not note:raise HTTPException(404,'Note not found.')
    security.owned('lessons',note['lesson_id'],user['id'])
    if note['document_id']:rag.remove(security.owned('documents',note['document_id'],user['id']))
    db.execute('DELETE FROM notes WHERE id=?',(nid,));return {'ok':True}

@app.get('/api/courses/{cid}/quizzes')
def quiz_list(cid:str,user=User):security.require_course(cid,user['id']);return db.rows('SELECT q.*,(SELECT score FROM attempts a WHERE a.quiz_id=q.id ORDER BY created_at DESC LIMIT 1) score FROM quizzes q WHERE course_id=? ORDER BY created_at DESC',(cid,))
@app.post('/api/courses/{cid}/quizzes')
def quiz_generate(cid:str,data:QuizInput,user=User):security.require_course(cid,user['id']);return learning.generate_quiz(cid,user['id'],data)
@app.get('/api/quizzes/{qid}')
def quiz_get(qid:str,user=User):security.owned('quizzes',qid,user['id']);return learning.quiz_public(qid)
@app.post('/api/quizzes/{qid}/attempts')
def quiz_attempt(qid:str,data:AttemptInput,user=User):return learning.grade_quiz(security.owned('quizzes',qid,user['id']),user['id'],data.answers)
@app.get('/api/courses/{cid}/revision')
def revision(cid:str,user=User):security.require_course(cid,user['id']);return learning.revisions(cid)
@app.get('/api/courses/{cid}/progress')
def progress(cid:str,user=User):
    security.require_course(cid,user['id'])
    lessons=db.rows('SELECT l.id,l.title,l.completed,l.confidence,l.minutes,l.studied_at,coalesce(m.score,0) mastery,coalesce(m.quiz,0) quiz,coalesce(m.weekly,0) weekly,coalesce(m.revision,0) revision FROM lessons l LEFT JOIN mastery m ON m.lesson_id=l.id WHERE l.course_id=?',(cid,))
    attempts=db.rows('SELECT a.id,a.score,a.created_at,q.title,q.kind FROM attempts a JOIN quizzes q ON q.id=a.quiz_id WHERE q.course_id=? ORDER BY a.created_at',(cid,))
    studied=db.one('SELECT coalesce(sum(minutes),0) minutes FROM blocks WHERE course_id=? AND completed=1',(cid,))['minutes']
    return {'lessons':lessons,'attempts':attempts,'study_minutes':studied,'completion':round(100*sum(l['completed'] for l in lessons)/max(1,len(lessons))),'mastery':round(sum(l['mastery'] for l in lessons)/max(1,len(lessons)),1)}

@app.get('/api/courses/{cid}/chats')
def chats(cid:str,user=User):security.require_course(cid,user['id']);return db.rows('SELECT * FROM chat_sessions WHERE course_id=? ORDER BY created_at DESC',(cid,))
@app.post('/api/courses/{cid}/chats',status_code=201)
def new_chat(cid:str,user=User):
    security.require_course(cid,user['id']);ident=db.uid();db.execute('INSERT INTO chat_sessions VALUES(?,?,?,?)',(ident,cid,'New conversation',db.now()));return {'id':ident}
@app.get('/api/chats/{sid}')
def chat_get(sid:str,user=User):
    session=security.owned('chat_sessions',sid,user['id']);return session|{'messages':db.rows('SELECT * FROM chat_messages WHERE session_id=? ORDER BY created_at',(sid,)),'actions':db.rows('SELECT * FROM chat_actions WHERE session_id=? ORDER BY created_at',(sid,))}
@app.post('/api/chats/{sid}/messages')
def chat_send(sid:str,data:ChatInput,user=User):
    session=security.owned('chat_sessions',sid,user['id']);return chat.respond(session,security.require_course(session['course_id'],user['id']),user['id'],data)
@app.put('/api/chats/{sid}')
def chat_rename(sid:str,data:TitleInput,user=User):security.owned('chat_sessions',sid,user['id']);db.execute('UPDATE chat_sessions SET title=? WHERE id=?',(data.title,sid));return {'ok':True}
@app.delete('/api/chats/{sid}')
def chat_delete(sid:str,user=User):security.owned('chat_sessions',sid,user['id']);db.execute('DELETE FROM chat_sessions WHERE id=?',(sid,));return {'ok':True}
@app.get('/api/courses/{cid}/files')
def files(cid:str,user=User):security.require_course(cid,user['id']);return db.rows('SELECT id,course_id,title,kind,sources,created_at FROM generated_files WHERE course_id=? ORDER BY created_at DESC',(cid,))
@app.post('/api/courses/{cid}/files')
def new_file(cid:str,data:ExportInput,user=User):return documents.generate(security.require_course(cid,user['id']),user['id'],data)
@app.get('/api/generated-files/{fid}/download')
def file_download(fid:str,format:str='pdf',user=User):
    f=security.owned('generated_files',fid,user['id'])
    if format not in ('pdf','md'):raise HTTPException(422,'Choose PDF or Markdown.')
    path=f['path'] if format=='pdf' else f['markdown_path']
    if not Path(path).is_file():raise HTTPException(404,'This generated file is missing. Generate it again.')
    return FileResponse(path,media_type='application/pdf' if format=='pdf' else 'text/markdown',filename=Path(path).name)

dist=config.ROOT/'dist'
if dist.exists():
    app.mount('/assets',StaticFiles(directory=dist/'assets'),name='assets')
    @app.get('/{path:path}')
    def frontend(path:str):
        if path.startswith('api/'):raise HTTPException(404,'API endpoint not found.')
        candidate=(dist/path).resolve()
        if candidate.is_relative_to(dist) and candidate.is_file():return FileResponse(candidate)
        return FileResponse(dist/'index.html')
