import os
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
os.environ['HF_HUB_OFFLINE']='1'
import pytest
from fastapi.testclient import TestClient
from app import config,db,rag,security
from app.main import app,auth_calls

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setattr(config,'DATA',tmp_path)
    monkeypatch.setattr(config,'PRODUCTION',False)
    security.cipher.cache_clear();auth_calls.clear()
    with TestClient(app) as c:
        response=c.post('/api/auth/register',json={'email':'learner@example.test','password':'test-only-long-password','name':'Test learner'})
        assert response.status_code==201,response.text
        yield c
    security.cipher.cache_clear()

@pytest.fixture
def course(client):
    response=client.post('/api/courses',json={'title':'Machine Learning','goal':'Understand generalization'})
    assert response.status_code==201,response.text
    return response.json()

@pytest.fixture
def semantic_model(monkeypatch):
    from sentence_transformers import SentenceTransformer
    cache=config.ROOT/'data'/'models'
    model=SentenceTransformer(config.MODEL,device='cpu',cache_folder=str(cache),local_files_only=True)
    monkeypatch.setattr(rag,'embedding_model',lambda:model)
    return model
