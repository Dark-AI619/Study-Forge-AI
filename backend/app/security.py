import hashlib
import hmac
import os
import secrets
import time
from functools import lru_cache
from cryptography.fernet import Fernet
from fastapi import HTTPException, Request
from . import config, db

def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    value = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 600000).hex()
    return salt + ':' + value

@lru_cache
def cipher():
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        if config.PRODUCTION: raise RuntimeError('ENCRYPTION_KEY is required in production')
        path = config.DATA / 'encryption.key'
        if not path.exists():
            path.write_bytes(Fernet.generate_key())
            try: path.chmod(0o600)
            except OSError: pass
        key = path.read_bytes()
    return Fernet(key)

def current_user(request: Request):
    token = request.cookies.get('studyforge_session', '')
    user = db.one('SELECT u.id,u.email,u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?', (hashlib.sha256(token.encode()).hexdigest(),time.time()))
    if not user: raise HTTPException(401,'Sign in to your StudyForge workspace.')
    return user

def require_course(course_id, user_id):
    course = db.one('SELECT * FROM courses WHERE id=? AND user_id=?',(course_id,user_id))
    if not course: raise HTTPException(404,'Course not found.')
    return course

def owned(table, item_id, user_id):
    # Table names are internal constants, never user-controlled input.
    item = db.one(f'SELECT t.* FROM {table} t JOIN courses c ON c.id=t.course_id WHERE t.id=? AND c.user_id=?',(item_id,user_id))
    if not item: raise HTTPException(404,'Item not found.')
    return item

def register(data):
    invite = os.getenv('REGISTRATION_INVITE_CODE')
    if invite and not hmac.compare_digest(data.invite_code, invite): raise HTTPException(403,'A workspace invitation code is required.')
    if db.one('SELECT id FROM users WHERE email=?',(data.email,)): raise HTTPException(409,'This email is already registered. Sign in instead.')
    user = {'id':db.uid(),'email':data.email,'name':data.name}
    with db.connect() as c:
        c.execute('INSERT INTO users VALUES(?,?,?,?,?)',(user['id'],data.email,password_hash(data.password),data.name,db.now()))
        c.execute('INSERT INTO settings(user_id) VALUES(?)',(user['id'],))
    return user

def login(data):
    user = db.one('SELECT * FROM users WHERE email=?',(data.email,))
    encoded = user['password'] if user else password_hash('not-the-password')
    valid = hmac.compare_digest(password_hash(data.password,encoded.split(':')[0]), encoded)
    if not user or not valid: raise HTTPException(401,'Email or password is incorrect.')
    return {k:user[k] for k in ('id','email','name')}

def session(user_id,response):
    token = secrets.token_urlsafe(48)
    db.execute('DELETE FROM sessions WHERE expires_at<?',(time.time(),))
    db.execute('INSERT INTO sessions VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),user_id,time.time()+86400*7))
    response.set_cookie('studyforge_session',token,httponly=True,secure=config.PRODUCTION,samesite='lax',max_age=86400*7,path='/')

def settings(user_id):
    item = db.one('SELECT * FROM settings WHERE user_id=?',(user_id,))
    item['api_key_configured'] = bool(item.pop('api_key',None))
    item['research_available'] = False
    return item

def save_settings(user_id,data):
    old = db.one('SELECT * FROM settings WHERE user_id=?',(user_id,))
    key = old['api_key']
    if data.api_key is not None: key = cipher().encrypt(data.api_key.encode()).decode() if data.api_key.strip() else None
    elif data.provider != old['provider']: key = None
    db.execute('UPDATE settings SET provider=?,model=?,api_key=?,theme=?,weights=? WHERE user_id=?',(data.provider,data.model,key,data.theme,db.dump(data.weights),user_id))
    return settings(user_id)
