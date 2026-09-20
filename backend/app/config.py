import os
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / '.env')
DATA = Path(os.getenv('STUDYFORGE_DATA_DIR', str(ROOT / 'data'))).resolve()
PRODUCTION = os.getenv('ENVIRONMENT', 'development') == 'production'
ORIGINS = [x.strip() for x in os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000').split(',') if x.strip()]
MODEL = os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
MODEL_CACHE = Path(os.getenv('EMBEDDING_CACHE_DIR', str(DATA / 'models'))).resolve()
MAX_UPLOAD = 20 * 1024 * 1024
MAX_PAGES = 1500
CONTEXT_CHARS = 24000
WEIGHTS = {'quiz': .35, 'weekly': .35, 'revision': .20, 'completion': .10}
PROVIDERS = {
    'groq': ('https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile'),
    'openai': ('https://api.openai.com/v1', 'gpt-4.1-mini'),
    'gemini': ('https://generativelanguage.googleapis.com/v1beta/openai', 'gemini-2.5-flash'),
}

def prepare():
    if PRODUCTION:
        from urllib.parse import urlsplit
        if not ORIGINS or any(urlsplit(x).scheme!='https' or not urlsplit(x).netloc or urlsplit(x).path or '*' in x for x in ORIGINS):
            raise RuntimeError('Set ALLOWED_ORIGINS to exact public HTTPS origins without trailing slashes in production.')
    for folder in ('uploads', 'indexes', 'generated'):
        (DATA / folder).mkdir(parents=True, exist_ok=True)
