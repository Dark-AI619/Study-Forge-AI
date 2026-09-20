import io
import json
import os
import subprocess
from datetime import date,timedelta
from pathlib import Path
from collections import defaultdict
import pytest
from pypdf import PdfReader
from app import db,config,rag,ai,learning,chat,documents,security
from app.schemas import CurriculumInput

TEXT='# Model Generalization\n## Overfitting\nOverfitting occurs when a model memorizes training data and performs poorly on unseen data. A validation set estimates performance on unseen examples. Regularization penalizes model complexity to reduce overfitting.\n## Cross validation\nCross validation divides the data into folds and evaluates performance across held-out folds. It helps assess how a model generalizes.\n'
CHINESE='# Mandarin Tones\nMandarin Chinese uses four main lexical tones and a neutral tone. The first tone is high and level. The second tone rises. Pinyin represents pronunciation using Latin letters.\n'

def save_plan(client,cid):
    p={'modules':[{'title':'Foundations','lessons':[{'title':'Overfitting','minutes':45,'difficulty':2},{'title':'Cross validation','minutes':40,'difficulty':2}]}]}
    response=client.put(f'/api/courses/{cid}/curriculum',json=p)
    assert response.status_code==200,response.text
    return response.json()['modules'][0]['lessons'][0]['id']

def make_pdf():
    from reportlab.pdfgen import canvas
    b=io.BytesIO();c=canvas.Canvas(b)
    y=790
    for line in TEXT.splitlines():
        for offset in range(0,len(line),90):c.drawString(40,y,line[offset:offset+90]);y-=18
    c.save();return b.getvalue()

def test_database_idempotent(client,course):
    db.init();assert client.get('/api/courses').json()[0]['id']==course['id']
    assert db.one('PRAGMA user_version')['user_version']==2

def test_curriculum_edit_preserves_ids_and_completion(client,course):
    lid=save_plan(client,course['id']);db.execute('UPDATE lessons SET completed=1 WHERE id=?',(lid,))
    plan=client.get(f'/api/courses/{course["id"]}/curriculum').json();plan['modules'][0]['lessons'][0]['title']='Understanding overfitting'
    response=client.put(f'/api/courses/{course["id"]}/curriculum',json=plan)
    assert response.json()['modules'][0]['lessons'][0]['id']==lid
    assert response.json()['modules'][0]['lessons'][0]['completed']==1
    plan['modules'][0]['lessons'][0]['id']='foreign-id'
    assert client.put(f'/api/courses/{course["id"]}/curriculum',json=plan).status_code==422

def test_task_lifecycle_does_not_imply_mastery(client,course):
    lid=save_plan(client,course['id'])
    task=client.post('/api/tasks',json={'title':'Practice today','course_id':course['id']}).json()
    assert client.put('/api/tasks/'+task['id'],json={**task,'status':'Completed'}).status_code==200
    assert client.get('/api/tasks').json()[0]['status']=='Completed'
    assert db.one('SELECT * FROM mastery WHERE lesson_id=?',(lid,)) is None
    client.delete('/api/tasks/'+task['id']);assert client.get('/api/tasks').json()==[]

def test_schedule_budget_order_and_history(client,course):
    lid=save_plan(client,course['id']);start=date(2026,9,21)
    response=client.post(f'/api/courses/{course["id"]}/schedule',json={'start':str(start)})
    assert response.status_code==200,response.text
    blocks=response.json()['blocks'];totals=defaultdict(int)
    for b in blocks:totals[b['date']]+=b['minutes']
    assert all(total<=60 for total in totals.values())
    assert any(b['kind']=='break' for b in blocks)
    assert any(b['kind']=='weekly_test' for b in blocks)
    assert not any(date.fromisoformat(b['date']).weekday()==6 for b in blocks)
    first=blocks[0];client.put('/api/blocks/'+first['id'],json={**first,'completed':True})
    replanned=client.post(f'/api/courses/{course["id"]}/schedule',json={'start':str(start)}).json()['blocks']
    assert any(b['id']==first['id'] and b['completed'] for b in replanned)
    totals=defaultdict(int)
    for b in replanned:totals[b['date']]+=b['minutes']
    assert all(total<=60 for total in totals.values())

def test_mastery_and_revision_are_separate():
    assert learning.mastery_score({'completion':100})==10
    assert learning.mastery_score({'completion':100,'quiz':100,'weekly':100,'revision':100})==100
    assert learning.revision_priority(30,.2,14)>learning.revision_priority(90,.9,1)

def test_missing_ai_and_key_encryption(client,course):
    response=client.post(f'/api/courses/{course["id"]}/curriculum/propose',json={})
    assert response.status_code==409
    s=client.get('/api/settings').json();s['api_key']='test-key-not-a-live-secret'
    assert client.put('/api/settings',json=s).status_code==200
    saved=db.one('SELECT api_key FROM settings')['api_key']
    assert 'test-key' not in saved
    assert security.cipher().decrypt(saved.encode()).decode()=='test-key-not-a-live-secret'
    assert 'api_key' not in client.get('/api/settings').json()
    s['weights']['quiz']=.9;assert client.put('/api/settings',json=s).status_code==422

def test_auth_and_cross_user_access(client,course):
    cid=course['id'];client.post('/api/auth/logout')
    assert client.get('/api/courses').status_code==401
    client.post('/api/auth/register',json={'email':'other@example.test','password':'second-long-password'})
    assert client.get('/api/courses').json()==[]
    assert client.get(f'/api/courses/{cid}/curriculum').status_code==404
    assert client.post('/api/tasks',json={'title':'foreign task','course_id':cid}).status_code==404

def test_origin_protection(client):
    response=client.post('/api/courses',json={'title':'CSRF'},headers={'Origin':'https://untrusted.example'})
    assert response.status_code==403

def test_upload_validation(client,course):
    url=f'/api/courses/{course["id"]}/documents'
    assert client.post(url,files={'file':('bad.exe',b'hello')}).status_code==415
    assert client.post(url,files={'file':('bad.pdf',b'not pdf')}).status_code==422
    assert client.post(url,files={'file':('empty.txt',b'')}).status_code==413

def test_real_pdf_faiss_isolation_deletion_and_rebuild(client,course,semantic_model):
    cid=course['id'];other=client.post('/api/courses',json={'title':'Mandarin Chinese'}).json()['id']
    pdf=client.post(f'/api/courses/{cid}/documents',files={'file':('../../notes.pdf',make_pdf(),'application/pdf')})
    assert pdf.status_code==201,pdf.text
    doc=pdf.json();assert doc['chunk_count']>0 and doc['page_count']==1 and '/' not in doc['source_name']
    d2=client.post(f'/api/courses/{other}/documents',files={'file':('mandarin.md',CHINESE.encode())}).json()
    hits=rag.retrieve(cid,'What is overfitting and how does regularization help?')
    assert hits and all(s['course_id']==cid for s in hits)
    assert not any('Mandarin' in s['excerpt'] for s in hits)
    assert all(s['page']==1 for s in hits)
    assert rag.retrieve(other,'What are Mandarin Chinese tones?')
    with pytest.raises(Exception):rag.retrieve(cid,'tones',[d2['id']])
    (config.DATA/'indexes'/cid/'vectors.faiss').write_bytes(b'corrupted')
    assert rag.retrieve(cid,'What is overfitting?')
    assert client.post('/api/documents/'+doc['id']+'/reindex').status_code==200
    assert client.delete('/api/documents/'+doc['id']).status_code==200
    assert rag.retrieve(cid,'overfitting')==[]
    assert rag.retrieve(other,'Mandarin tones')

def test_strict_insufficient_and_extractive(client,course,semantic_model):
    cid=course['id'];response=client.post(f'/api/courses/{cid}/rag',json={'query':'Explain overfitting'}).json()
    assert not response['grounded'] and response['sources']==[]
    client.post(f'/api/courses/{cid}/documents',files={'file':('notes.md',TEXT.encode())})
    response=client.post(f'/api/courses/{cid}/rag',json={'query':'Explain overfitting'}).json()
    assert response['extractive'] and response['sources'] and 'AI is not configured' in response['answer']

class FixtureProvider(ai.AIProvider):
    """Explicit deterministic test fixture. Never loaded by production code."""
    def generate(self,messages,*,json_mode=False):return '# Study guide\n## Objectives\nExplain overfitting.\n## Summary\nRegularization penalizes complexity.\n'
    def generate_json(self,messages):
        system=messages[0]['content'];payload=json.loads(messages[-1]['content'])
        if 'Classify this study request' in system:
            message=payload['message'].lower();action=next((a for word,a in [('curriculum','curriculum'),('task','task'),('quiz','quiz'),('timetable','schedule'),('weak','weaknesses'),('pdf','export'),('revision guide','export'),('lesson','lesson')] if word in message),'answer')
            return {'action':action,'title':'Practice overfitting','lesson_id':payload['lessons'][0]['id'] if payload['lessons'] else None,'count':2,'kind':'Study Guide','date':str(date.today()+timedelta(days=1))}
        if 'editable learning curriculum' in system:return {'modules':[{'title':'Generalization','lessons':[{'title':'Overfitting','minutes':45,'difficulty':2}]}]}
        if 'Write one useful lesson' in system:return {'objectives':['Explain overfitting'],'prerequisites':[],'explanation':'Overfitting occurs when a model memorizes training data and performs poorly on unseen data. Regularization penalizes complexity.','examples':['A very deep decision tree can memorize training examples.'],'terminology':['Generalization: performance on unseen examples.'],'exercise':'Explain why a validation set is useful.','common_mistakes':['Evaluating only on training data.'],'summary':'Use held-out evaluation.','knowledge_check':['What does regularization penalize?']}
        if 'Generate a quiz ONLY' in system:
            lid=payload['lessons'][0]['id']
            return {'title':'Generalization quiz','questions':[{'lesson_id':lid,'prompt':'What does regularization penalize?','kind':'mcq','options':['Complexity','Validation'],'answer':'Complexity','explanation':'Regularization penalizes model complexity.','concept':'Regularization'},{'lesson_id':lid,'prompt':'Explain the purpose of validation.','kind':'short_answer','options':[],'answer':'Estimate performance on unseen data.','explanation':'Validation estimates generalization.','concept':'Validation'}]}
        if 'Grade these answers' in system:return {'grades':[{'id':q['id'],'score':1,'feedback':'Correct: held-out evaluation estimates generalization.'} for q in payload['questions']]}
        if 'Answer ONLY' in system:
            s=payload['sources'][0];return {'sufficient':True,'answer':'Regularization penalizes model complexity.','citations':[{'id':s['id'],'quote':s['excerpt'][:60]}]}
        raise AssertionError(system)

def test_complete_learning_loop_and_restart(client,course,semantic_model,monkeypatch):
    monkeypatch.setattr(ai,'provider_for',lambda *args,**kwargs:FixtureProvider())
    cid=course['id'];doc=client.post(f'/api/courses/{cid}/documents',files={'file':('ml.pdf',make_pdf())}).json()
    proposal=client.post(f'/api/courses/{cid}/curriculum/propose',json={'document_ids':[doc['id']]}).json()
    plan=client.put(f'/api/courses/{cid}/curriculum',json=proposal).json();lid=plan['modules'][0]['lessons'][0]['id']
    assert client.post('/api/lessons/'+lid+'/generate',json={}).status_code==200
    assert client.post('/api/lessons/'+lid+'/study').status_code==200
    assert client.post('/api/lessons/'+lid+'/feedback',json={'response':'understand'}).json()['score']==10
    assert client.post(f'/api/courses/{cid}/schedule',json={'start':str(date.today())}).status_code==200
    quiz=client.post(f'/api/courses/{cid}/quizzes',json={'lesson_id':lid,'count':2}).json()
    assert all('answer' not in q for q in quiz['questions'])
    attempt=client.post('/api/quizzes/'+quiz['id']+'/attempts',json={'answers':{quiz['questions'][0]['id']:'Validation',quiz['questions'][1]['id']:'Estimate performance on unseen data'}})
    assert attempt.status_code==200,attempt.text
    assert attempt.json()['score']==50
    assert 'Regularization' in attempt.json()['weak_concepts']
    assert db.one('SELECT score FROM mastery WHERE lesson_id=?',(lid,))['score']>10
    assert client.get(f'/api/courses/{cid}/revision').json()
    note=client.post('/api/lessons/'+lid+'/notes',json={'category':'Remember','content':'Regularization controls model complexity.','indexed':True});assert note.status_code==201,note.text
    chat_id=client.post(f'/api/courses/{cid}/chats').json()['id']
    for message in ['Explain overfitting','Create a task','Create a quiz','Add this lesson to the timetable','Show my weak concepts','Create a revision guide PDF']:
        response=client.post('/api/chats/'+chat_id+'/messages',json={'message':message,'document_ids':[doc['id']]})
        assert response.status_code==200,response.text
        assert not response.json().get('error'),response.text
    assert client.get('/api/tasks').json()
    file=client.post(f'/api/courses/{cid}/files',json={'title':'My learning guide','kind':'Study Guide'}).json()
    pdf=client.get('/api/generated-files/'+file['id']+'/download')
    assert pdf.content.startswith(b'%PDF-')
    assert 'Overfitting' in ''.join(p.extract_text() for p in PdfReader(io.BytesIO(pdf.content)).pages) or 'overfitting' in ''.join(p.extract_text() for p in PdfReader(io.BytesIO(pdf.content)).pages)
    assert client.get('/api/generated-files/'+file['id']+'/download?format=md').status_code==200
    env={**os.environ,'STUDYFORGE_DATA_DIR':str(config.DATA),'PYTHONPATH':str(Path(__file__).parents[1])}
    check=subprocess.run([os.sys.executable,'-c',"from app import db;db.init();print(db.one('SELECT count(*) n FROM chat_messages')['n']);print(db.one('SELECT count(*) n FROM attempts')['n'])"],env=env,capture_output=True,text=True,check=True)
    assert int(check.stdout.splitlines()[0])>=12 and int(check.stdout.splitlines()[1])>=1

def test_generated_curriculum_pdf_without_ai(client,course):
    save_plan(client,course['id'])
    response=client.post(f'/api/courses/{course["id"]}/files',json={'title':'Learning roadmap','kind':'Curriculum'})
    assert response.status_code==200,response.text
    data=client.get('/api/generated-files/'+response.json()['id']+'/download').content
    assert len(PdfReader(io.BytesIO(data)).pages)>=1

def test_malformed_ai_json_is_graceful():
    class BadProvider(ai.AIProvider):
        def generate(self,*args,**kwargs):return 'not JSON'
    with pytest.raises(Exception) as error:BadProvider().generate_json([])
    assert error.value.status_code==502

def test_fabricated_citation_refused(client,course,semantic_model,monkeypatch):
    cid=course['id'];client.post(f'/api/courses/{cid}/documents',files={'file':('notes.md',TEXT.encode())})
    class WrongCitation(FixtureProvider):
        def generate_json(self,messages):return {'sufficient':True,'answer':'Unsupported claim','citations':[{'id':'invented','quote':'not in a source'}]}
    monkeypatch.setattr(ai,'provider_for',lambda *args,**kwargs:WrongCitation())
    result=client.post(f'/api/courses/{cid}/rag',json={'query':'overfitting'}).json()
    assert result['grounded'] is False and result['sources']==[]


def test_document_scope_survives_edit_and_reindex(client,course,semantic_model):
    cid=course['id']
    doc=client.post(f'/api/courses/{cid}/documents',files={'file':('source.md',TEXT.encode(),'text/markdown')}).json()
    lid=save_plan(client,cid)
    plan=client.get(f'/api/courses/{cid}/curriculum').json()
    plan['document_ids']=[doc['id']]
    assert client.put(f'/api/courses/{cid}/curriculum',json=plan).status_code==200
    loaded=client.get(f'/api/courses/{cid}/curriculum').json()
    assert loaded['document_ids']==[doc['id']]
    loaded['modules'][0]['title']='Edited foundation'
    assert client.put(f'/api/courses/{cid}/curriculum',json=loaded).json()['document_ids']==[doc['id']]
    assert client.post(f'/api/lessons/{lid}/generate',json={}).status_code==200
    client.post(f'/api/lessons/{lid}/study')
    assert rag.retrieve(cid,'overfitting',[doc['id']],completed_only=True)
    before={s['id'] for s in rag.retrieve(cid,'overfitting',[doc['id']],completed_only=True)}
    assert client.post('/api/documents/'+doc['id']+'/reindex').status_code==200
    assert {s['id'] for s in rag.retrieve(cid,'overfitting',[doc['id']],completed_only=True)}==before
    note=client.post(f'/api/lessons/{lid}/notes',json={'category':'Remember','content':'Regularization reduces overfitting','indexed':True})
    assert note.status_code==201
    nd=db.one("SELECT * FROM documents WHERE content_type='note'")
    rag.reindex(nd)
    assert db.one('SELECT lesson_id FROM chunks WHERE document_id=?',(nd['id'],))['lesson_id']==lid


def test_reschedule_does_not_repeat_completed_minutes(client,course):
    lid=save_plan(client,course['id'])
    start=date(2026,9,21)
    blocks=learning.make_schedule(course,start)['blocks']
    first=next(b for b in blocks if b['lesson_id']==lid)
    client.put('/api/blocks/'+first['id'],json={**first,'completed':True})
    rebuilt=learning.make_schedule(course,start)['blocks']
    assert sum(b['minutes'] for b in rebuilt if b['lesson_id']==lid)==45
    db.execute('UPDATE lessons SET minutes=5 WHERE id=?',(lid,))
    db.execute('DELETE FROM blocks WHERE course_id=?',(course['id'],))
    short=learning.make_schedule(course,start)['blocks']
    assert sum(b['minutes'] for b in short if b['lesson_id']==lid)==5


def test_review_becomes_due_again(client,course):
    lid=save_plan(client,course['id']);learning.queue_revision(lid,'Overfitting')
    db.execute("UPDATE revision_queue SET status='Reviewed',due_date=?,last_reviewed=? WHERE lesson_id=?",((date.today()-timedelta(days=1)).isoformat(),db.now(),lid))
    assert learning.revisions(course['id'])[0]['status']=='Due'


@pytest.mark.parametrize('status,expected',[(401,400),(403,400),(429,429),(500,502)])
def test_provider_http_failures_are_actionable(monkeypatch,status,expected):
    import httpx
    real_client=httpx.Client
    def handler(request):
        assert str(request.url)=='https://api.groq.com/openai/v1/chat/completions'
        assert request.headers['Authorization']=='Bearer test-only-key'
        return httpx.Response(status,json={'error':'provider details must not leak'})
    monkeypatch.setattr(ai.httpx,'Client',lambda **kwargs:real_client(transport=httpx.MockTransport(handler)))
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as error:
        ai.ChatCompletionsProvider('groq','test-model','test-only-key').generate([{'role':'user','content':'Hello'}])
    assert error.value.status_code==expected
    assert 'provider details' not in str(error.value.detail)


def test_json_array_is_rejected():
    from fastapi import HTTPException
    class ArrayProvider(ai.AIProvider):
        def generate(self,*args,**kwargs):return '[]'
    with pytest.raises(HTTPException):ArrayProvider().generate_json([])


def test_selected_document_quiz_rejects_other_studied_material(client,course,semantic_model,monkeypatch):
    cid=course['id'];lid=save_plan(client,cid)
    ml=client.post(f'/api/courses/{cid}/documents',files={'file':('ml.md',TEXT.encode())}).json()
    other=client.post(f'/api/courses/{cid}/documents',files={'file':('tones.md',CHINESE.encode())}).json()
    assert client.post(f'/api/lessons/{lid}/generate',json={'document_ids':[ml['id']]}).status_code==200
    client.post(f'/api/lessons/{lid}/study')
    monkeypatch.setattr(ai,'provider_for',lambda *args,**kwargs:FixtureProvider())
    rejected=client.post(f'/api/courses/{cid}/quizzes',json={'document_ids':[other['id']]})
    assert rejected.status_code==409
    assert client.post(f'/api/courses/{cid}/quizzes',json={'document_ids':[ml['id']]}).status_code==200


def test_production_rejects_local_origins_and_missing_encryption_key(client,monkeypatch):
    monkeypatch.setattr(config,'PRODUCTION',True)
    monkeypatch.setattr(config,'ORIGINS',['http://localhost:3000'])
    with pytest.raises(RuntimeError,match='HTTPS'):config.prepare()
    monkeypatch.setattr(config,'ORIGINS',['https://studyforge.example'])
    config.prepare()
    monkeypatch.delenv('ENCRYPTION_KEY',raising=False)
    security.cipher.cache_clear()
    with pytest.raises(RuntimeError,match='ENCRYPTION_KEY'):security.cipher()


def test_weekly_and_revision_scores_update_distinct_components(client,course,semantic_model,monkeypatch):
    cid=course['id'];lid=save_plan(client,cid)
    client.post(f'/api/courses/{cid}/documents',files={'file':('ml.md',TEXT.encode())})
    monkeypatch.setattr(ai,'provider_for',lambda *args,**kwargs:FixtureProvider())
    client.post(f'/api/lessons/{lid}/generate',json={});client.post(f'/api/lessons/{lid}/study')
    client.post(f'/api/lessons/{lid}/feedback',json={'response':'understand'})
    learning.queue_revision(lid,'Regularization')
    for kind in ('weekly','revision'):
        quiz=client.post(f'/api/courses/{cid}/quizzes',json={'kind':kind,'count':2}).json()
        result=client.post('/api/quizzes/'+quiz['id']+'/attempts',json={'answers':{quiz['questions'][0]['id']:'Complexity',quiz['questions'][1]['id']:'Estimate unseen performance'}})
        assert result.status_code==200,result.text
        assert result.json()['score']==100
    score=db.one('SELECT * FROM mastery WHERE lesson_id=?',(lid,))
    assert score['weekly']==100 and score['revision']==100 and score['quiz']==0 and score['score']==65
    assert db.one("SELECT status FROM revision_queue WHERE lesson_id=? AND concept='Regularization'",(lid,))['status']=='Reviewed'


def test_public_contracts_and_secure_production_cookie(client,monkeypatch):
    assert 'api_key' not in client.get('/api/settings').json()
    assert set(client.get('/api/auth/me').json())=={'id','email','name'}
    from fastapi.testclient import TestClient
    from app.main import app
    monkeypatch.setattr(config,'PRODUCTION',True)
    from cryptography.fernet import Fernet
    monkeypatch.setattr(config,'ORIGINS',['https://studyforge.example'])
    monkeypatch.setenv('ENCRYPTION_KEY',Fernet.generate_key().decode())
    security.cipher.cache_clear()
    with TestClient(app,base_url='https://studyforge.example') as secure:
        login=secure.post('/api/auth/login',json={'email':'learner@example.test','password':'test-only-long-password'})
        assert login.status_code==200
        cookie=login.headers['set-cookie'].lower()
        assert 'secure' in cookie and 'httponly' in cookie and 'samesite=lax' in cookie
        assert secure.get('/api/auth/me').status_code==200


def test_unindexed_personal_notes_export_without_ai(client,course):
    lid=save_plan(client,course['id'])
    note='My private reminder: compare validation and training performance.'
    assert client.post(f'/api/lessons/{lid}/notes',json={'content':note,'category':'Remember','indexed':False}).status_code==201
    response=client.post(f'/api/courses/{course["id"]}/files',json={'kind':'Lesson Notes','title':'My own notes'})
    assert response.status_code==200,response.text
    ident=response.json()['id']
    markdown=client.get('/api/generated-files/'+ident+'/download?format=md').text
    assert note in markdown and 'Personal notes' in markdown
    assert client.get('/api/generated-files/'+ident+'/download').content.startswith(b'%PDF-')


def test_reindex_repeated_passages_preserves_distinct_ids(client,course,semantic_model):
    repeated=('A repeated learning passage about validation and generalization. '*20+'\n')*3
    doc=rag.ingest(course['id'],'repetition.txt',repeated.encode())
    before=db.rows('SELECT id FROM chunks WHERE document_id=?',(doc['id'],))
    assert len(before)>=2
    rag.reindex(doc)
    assert {r['id'] for r in db.rows('SELECT id FROM chunks WHERE document_id=?',(doc['id'],))}=={r['id'] for r in before}
