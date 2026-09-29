import uuid
import pytest
from fastapi.testclient import TestClient
from app import db,ai,assistant,preferences,research,rag
from app.main import app

def conversation(client,course=None):
    r=client.post('/api/assistant/sessions',json={'course_id':course['id'] if course else None})
    assert r.status_code==201,r.text
    return r.json()['id']

def test_preferences_isolation_and_prompt(client):
    p=client.get('/api/preferences').json();p.update(display_name='Ada',depth='detailed',language='Urdu')
    assert client.put('/api/preferences',json=p).status_code==200
    uid=client.get('/api/auth/me').json()['id']
    assert client.get('/api/auth/me').json()['name']=='Ada'
    assert 'Urdu' in preferences.prompt(uid)
    with TestClient(app) as other:
        other.post('/api/auth/register',json={'email':'other@example.test','password':'another-test-password'})
        assert other.get('/api/preferences').json()['language']=='English'
    p['personalization']=False
    client.put('/api/preferences',json=p)
    assert preferences.prompt(uid)==''

def test_assistant_confirmation_idempotence_and_isolation(client,course):
    sid=conversation(client,course)
    action=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'create_task','title':'Read Chapter 3'}).json()
    assert client.get('/api/tasks').json()==[]
    url=f"/api/assistant/actions/{action['id']}/confirm"
    assert client.post(url,json={'confirmed':False}).status_code==409
    with TestClient(app) as other:
        other.post('/api/auth/register',json={'email':'outsider@example.test','password':'another-test-password'})
        assert other.get(f'/api/assistant/sessions/{sid}').status_code==404
        assert other.post(url,json={'confirmed':True}).status_code==404
        assert other.get('/api/assistant/activity').json()==[]
    assert client.post(url,json={'confirmed':True}).status_code==200
    assert client.post(url,json={'confirmed':True}).status_code==200
    assert len(client.get('/api/tasks').json())==1
    assert client.get('/api/assistant/activity').json()[0]['status']=='done'

def test_destructive_action_requires_explicit_confirmation(client):
    task=client.post('/api/tasks',json={'title':'Disposable fixture'}).json()
    sid=conversation(client)
    proposal=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'delete_task','item_id':task['id']}).json()
    assert len(client.get('/api/tasks').json())==1
    url=f"/api/assistant/actions/{proposal['id']}/confirm"
    assert client.post(url,json={}).status_code==409
    assert len(client.get('/api/tasks').json())==1
    assert client.post(url,json={'confirmed':True}).status_code==200
    assert client.get('/api/tasks').json()==[]

def test_typed_actions_reject_unknown_and_cross_course(client,course):
    second=client.post('/api/courses',json={'title':'Another course'}).json()
    client.put(f"/api/courses/{second['id']}/curriculum",json={'modules':[{'title':'Unit','lessons':[{'title':'Lesson'}]}]})
    lid=db.one('SELECT id FROM lessons WHERE course_id=?',(second['id'],))['id']
    sid=conversation(client,course)
    assert client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'execute_sql','content':'DROP TABLE users'}).status_code==422
    assert client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'generate_quiz','lesson_id':lid}).status_code==404

def test_conversation_survives_reinit_and_duplicate_request(client):
    sid=conversation(client);request={'message':'How do I use this app?','mode':'guide','request_id':str(uuid.uuid4())}
    assert client.post(f'/api/assistant/sessions/{sid}/messages',json=request).status_code==200
    assert client.post(f'/api/assistant/sessions/{sid}/messages',json=request).status_code==409
    db.init();assistant.init()
    result=client.get(f'/api/assistant/sessions/{sid}').json()
    assert len(result['messages'])==2
    assert result['messages'][0]['content']==request['message']

def test_research_does_not_automatically_enter_strict_sources(client,course,semantic_model,monkeypatch):
    external={'id':'wiki:1','source_name':'Generalization','url':'https://en.wikipedia.org/wiki/Generalization','excerpt':'Generalization means learning patterns that apply to new cases.','origin':'external'}
    monkeypatch.setattr(research,'public_sources',lambda q:[external])
    sid=conversation(client,course)
    result=client.post(f'/api/assistant/sessions/{sid}/messages',json={'message':'Generalization','mode':'research','request_id':str(uuid.uuid4())}).json()
    assert result['sources'][0]['origin']=='external'
    assert db.one('SELECT count(*) n FROM documents')['n']==0
    note=rag.ingest(course['id'],'research.md',external['excerpt'].encode(),'research')
    assert rag.retrieve(course['id'],'Generalization')==[]
    assert rag.retrieve(course['id'],'Generalization',[note['id']])
    assert rag.outline_context(course['id'])['total_chunks']==0

def test_research_citations_must_match_observed_sources(client,monkeypatch):
    monkeypatch.setattr(research,'public_sources',lambda q:[{'id':'wiki:1','excerpt':'This is the actual passage text.','origin':'external'}])
    class Fake:
        def generate_json(self,messages):return {'answer':'Unfounded','citations':[{'id':'invented','quote':'This is the actual passage text.'}]}
    monkeypatch.setattr(ai,'provider_for',lambda *a,**k:Fake())
    uid=client.get('/api/auth/me').json()['id']
    with pytest.raises(Exception) as exc: research.answer(uid,'query')
    assert exc.value.status_code==502

def test_duplicate_upload_same_course_only(client,course,semantic_model):
    raw=b'Chapter 1 Generalization\nOverfitting reduces generalization on unseen test examples.'
    first=rag.ingest(course['id'],'chapter.txt',raw)
    r=client.post(f"/api/courses/{course['id']}/documents",files={'file':('again.txt',raw)})
    assert r.status_code==409
    other=client.post('/api/courses',json={'title':'Independent'}).json()
    assert rag.ingest(other['id'],'chapter.txt',raw)['id']!=first['id']

def test_additive_plan_preserves_existing_curriculum(client,course):
    sid=conversation(client,course)
    for title in ['First','Second']:
        a=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'add_topic','title':title}).json()
        assert client.post(f"/api/assistant/actions/{a['id']}/confirm",json={'confirmed':True}).status_code==200
    assert db.one('SELECT count(*) n FROM lessons WHERE course_id=?',(course['id'],))['n']==2

def test_uncertain_action_never_replays(client,course):
    sid=conversation(client,course)
    a=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'create_task','title':'Do not repeat'}).json()
    db.execute("UPDATE assistant_actions SET status='running' WHERE id=?",(a['id'],))
    assistant.init()
    assert client.post(f"/api/assistant/actions/{a['id']}/confirm",json={'confirmed':True}).status_code==409
    assert client.get('/api/tasks').json()==[]


def test_cancelled_action_and_strict_confirmation(client,course):
    sid=conversation(client,course)
    a=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'create_task','title':'Decline me'}).json()
    base=f"/api/assistant/actions/{a['id']}"
    assert client.post(base+'/confirm',json={'confirmed':'true'}).status_code==422
    assert client.post(base+'/cancel').status_code==200
    assert client.post(base+'/confirm',json={'confirmed':True}).status_code==409
    assert client.get('/api/tasks').json()==[]

def test_topic_content_and_revision_session(client,course):
    sid=conversation(client,course)
    a=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'add_topic','title':'Generalization','content':'Research with explicit references.'}).json()
    lid=client.post(f"/api/assistant/actions/{a['id']}/confirm",json={'confirmed':True}).json()['id']
    assert 'explicit references' in db.one('SELECT content FROM lessons WHERE id=?',(lid,))['content']['explanation']
    from app import learning
    learning.queue_revision(lid,'Generalization')
    a=client.post(f'/api/assistant/sessions/{sid}/actions',json={'kind':'revision'}).json()
    assert client.post(f"/api/assistant/actions/{a['id']}/confirm",json={'confirmed':True}).status_code==200
    assert db.one("SELECT count(*) n FROM blocks WHERE course_id=? AND kind='revision'",(course['id'],))['n']==1

def test_railway_requires_real_mount(tmp_path,monkeypatch):
    from app import config
    monkeypatch.setattr(config,'PRODUCTION',True)
    monkeypatch.setattr(config,'DATA',tmp_path/'data')
    monkeypatch.setattr(config,'ORIGINS',['https://studyforge.example'])
    monkeypatch.setenv('RAILWAY_ENVIRONMENT_ID','test')
    monkeypatch.delenv('RAILWAY_VOLUME_MOUNT_PATH',raising=False)
    with pytest.raises(RuntimeError,match='mounted persistent volume'):config.prepare()
    monkeypatch.setenv('RAILWAY_VOLUME_MOUNT_PATH',str(tmp_path))
    monkeypatch.setattr(config.os.path,'ismount',lambda p:False)
    with pytest.raises(RuntimeError,match='mounted persistent volume'):config.prepare()
    monkeypatch.setattr(config.os.path,'ismount',lambda p:True)
    config.prepare()
    assert (config.DATA/'uploads').is_dir()

def test_assistant_rate_limit(client):
    sid=conversation(client)
    for i in range(10):
        r=client.post(f'/api/assistant/sessions/{sid}/messages',json={'message':'How do I use Knowledge?','mode':'guide','request_id':str(uuid.uuid4())})
        assert r.status_code==200
    r=client.post(f'/api/assistant/sessions/{sid}/messages',json={'message':'One more','mode':'guide','request_id':str(uuid.uuid4())})
    assert r.status_code==429


@pytest.mark.parametrize('status,body,expected',[
 (400,{'error':{'status':'INVALID_ARGUMENT','details':[{'reason':'API_KEY_INVALID'}]}},'Authentication rejected'),
 (404,{'error':{'status':'NOT_FOUND'}},'selected model is unavailable'),
 (400,{'error':{'status':'INVALID_ARGUMENT','message':'secret-key must never leak'}},'request format'),
 (429,{'error':{'status':'RESOURCE_EXHAUSTED'}},'quota or rate limit'),
 (503,{'error':{'message':'secret-key'}},'unavailable (HTTP 503)')])
def test_provider_error_classification(status,body,expected):
    import httpx
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:ai.check_response(httpx.Response(status,json=body))
    assert expected in exc.value.detail
    assert 'secret-key' not in exc.value.detail

def test_gemini_discovery_is_owned_and_filters_nontext(client,monkeypatch):
    import httpx
    saved=client.get('/api/settings').json()
    saved.update(provider='gemini',model='test-text',api_key='test-only-key')
    client.put('/api/settings',json=saved)
    real=httpx.Client
    def handler(request):
        assert request.url.host=='generativelanguage.googleapis.com'
        assert request.headers['x-goog-api-key']=='test-only-key'
        assert 'key=' not in str(request.url)
        return httpx.Response(200,json={'models':[
         {'name':'models/test-text','displayName':'Text','supportedGenerationMethods':['generateContent']},
         {'name':'models/test-embed','supportedGenerationMethods':['embedContent']},
         {'name':'models/test-image','supportedGenerationMethods':['generateContent']}]})
    monkeypatch.setattr(ai.httpx,'Client',lambda **kw:real(transport=httpx.MockTransport(handler)))
    result=client.get('/api/settings/models?provider=gemini')
    assert result.status_code==200
    assert result.json()['models']==[{'id':'test-text','name':'Text'}]
    assert 'test-only-key' not in result.text
    assert client.get('/api/settings/models?provider=groq').status_code==409
    with TestClient(app) as other:
        other.post('/api/auth/register',json={'email':'discovery-other@example.test','password':'another-test-password'})
        assert other.get('/api/settings/models?provider=gemini').status_code==409
