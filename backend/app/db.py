import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from uuid import uuid4
from . import config

def uid(): return str(uuid4())
def now(): return datetime.now(timezone.utc).isoformat()
def dump(value): return json.dumps(value, ensure_ascii=False)
def unpack(row):
    if row is None: return None
    item = dict(row)
    for key in ('availability', 'content', 'sources', 'options', 'result', 'weights', 'document_ids', 'payload'):
        if key in item and item[key] is not None:
            try: item[key] = json.loads(item[key])
            except (ValueError, TypeError): pass
    return item

@contextmanager
def connect():
    con = sqlite3.connect(config.DATA / 'studyforge.sqlite3', timeout=30)
    con.row_factory = sqlite3.Row
    con.execute('PRAGMA foreign_keys=ON')
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally: con.close()

def rows(sql, args=()):
    with connect() as con: return [unpack(r) for r in con.execute(sql, args).fetchall()]
def one(sql, args=()):
    with connect() as con: return unpack(con.execute(sql, args).fetchone())
def execute(sql, args=()):
    with connect() as con: return con.execute(sql, args).rowcount

def init():
    config.prepare()
    with connect() as c:
        c.execute('PRAGMA journal_mode=WAL')
        c.executescript('''
        CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,name TEXT NOT NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS settings(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,provider TEXT DEFAULT 'groq',model TEXT DEFAULT 'llama-3.3-70b-versatile',api_key TEXT,theme TEXT DEFAULT 'dark',weights TEXT NOT NULL DEFAULT '{"quiz":0.35,"weekly":0.35,"revision":0.2,"completion":0.1}');
        CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,goal TEXT NOT NULL DEFAULT '',level TEXT NOT NULL DEFAULT 'Beginner',style TEXT NOT NULL DEFAULT 'Mixed',weeks INTEGER NOT NULL DEFAULT 6,daily_minutes INTEGER NOT NULL DEFAULT 60,availability TEXT NOT NULL DEFAULT '[0,1,2,3,4]',revision_day INTEGER DEFAULT 5,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS modules(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,position INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS lessons(id TEXT PRIMARY KEY,module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,position INTEGER NOT NULL,minutes INTEGER NOT NULL DEFAULT 45,difficulty INTEGER DEFAULT 1,content TEXT,completed INTEGER NOT NULL DEFAULT 0,confidence REAL DEFAULT 0.5,studied_at TEXT,completed_at TEXT,sources TEXT NOT NULL DEFAULT '[]');
        CREATE TABLE IF NOT EXISTS blocks(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,date TEXT NOT NULL,kind TEXT NOT NULL,title TEXT NOT NULL,minutes INTEGER NOT NULL,position INTEGER DEFAULT 0,completed INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,description TEXT DEFAULT '',due_date TEXT,priority TEXT DEFAULT 'Medium',minutes INTEGER DEFAULT 30,status TEXT DEFAULT 'To Do',created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,source_name TEXT NOT NULL,path TEXT NOT NULL,page_count INTEGER NOT NULL,content_type TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,version INTEGER DEFAULT 1);
        CREATE TABLE IF NOT EXISTS chunks(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,module_id TEXT REFERENCES modules(id) ON DELETE SET NULL,lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,source_name TEXT NOT NULL,page INTEGER,chapter TEXT,section TEXT,subsection TEXT,content TEXT NOT NULL,content_type TEXT NOT NULL,created_at TEXT NOT NULL,version INTEGER DEFAULT 1,embedding BLOB);
        CREATE TABLE IF NOT EXISTS quizzes(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,title TEXT NOT NULL,kind TEXT NOT NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS questions(id TEXT PRIMARY KEY,quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,prompt TEXT NOT NULL,kind TEXT NOT NULL,options TEXT NOT NULL DEFAULT '[]',answer TEXT NOT NULL,explanation TEXT NOT NULL,concept TEXT NOT NULL,position INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY,quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,score REAL NOT NULL,created_at TEXT NOT NULL,result TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS answers(id TEXT PRIMARY KEY,attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,answer TEXT NOT NULL,score REAL NOT NULL,feedback TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS mastery(lesson_id TEXT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,quiz REAL DEFAULT 0,weekly REAL DEFAULT 0,revision REAL DEFAULT 0,completion REAL DEFAULT 0,score REAL DEFAULT 0,updated_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS revision_queue(id TEXT PRIMARY KEY,lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,concept TEXT NOT NULL,priority REAL NOT NULL,due_date TEXT NOT NULL,last_reviewed TEXT,status TEXT DEFAULT 'Due',UNIQUE(lesson_id,concept));
        CREATE TABLE IF NOT EXISTS notes(id TEXT PRIMARY KEY,lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,category TEXT NOT NULL,content TEXT NOT NULL,indexed INTEGER DEFAULT 0,document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS chat_sessions(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS chat_messages(id TEXT PRIMARY KEY,session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,role TEXT NOT NULL,content TEXT NOT NULL,sources TEXT NOT NULL DEFAULT '[]',created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS chat_attachments(session_id TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE,document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,PRIMARY KEY(session_id,document_id));
        CREATE TABLE IF NOT EXISTS chat_actions(id TEXT PRIMARY KEY,session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,kind TEXT NOT NULL,payload TEXT NOT NULL,result TEXT NOT NULL,created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS generated_files(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,kind TEXT NOT NULL,path TEXT NOT NULL,markdown_path TEXT NOT NULL,sources TEXT NOT NULL DEFAULT '[]',created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS research_sources(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,url TEXT NOT NULL,title TEXT NOT NULL,accepted_at TEXT);
        CREATE INDEX IF NOT EXISTS chunks_scope ON chunks(course_id,document_id);
        CREATE INDEX IF NOT EXISTS lessons_order ON lessons(course_id,module_id,position);
        CREATE INDEX IF NOT EXISTS blocks_date ON blocks(course_id,date);
        PRAGMA user_version=1;
        ''')
        if 'document_scope' not in {r[1] for r in c.execute('PRAGMA table_info(courses)')}:
            c.execute("ALTER TABLE courses ADD COLUMN document_scope TEXT NOT NULL DEFAULT '[]'")
        c.execute('PRAGMA user_version=2')
