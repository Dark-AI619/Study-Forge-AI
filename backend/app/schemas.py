from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator

class Credentials(BaseModel):
    email: str = Field(min_length=3,max_length=254)
    password: str = Field(min_length=12,max_length=200)
    name: str = Field(default='Learner',min_length=1,max_length=80)
    invite_code: str = ''
    @field_validator('email')
    @classmethod
    def email_valid(cls,v):
        if '@' not in v: raise ValueError('Enter a valid email address')
        return v.strip().lower()

class CourseInput(BaseModel):
    title: str = Field(min_length=1,max_length=180)
    goal: str = Field(default='',max_length=3000)
    level: Literal['Beginner','Intermediate','Advanced','Let AI determine'] = 'Beginner'
    style: Literal['Theory','Practical','Project-based','Mixed'] = 'Mixed'
    weeks: int = Field(default=6,ge=1,le=52)
    daily_minutes: int = Field(default=60,ge=15,le=480)
    availability: list[int] = Field(default=[0,1,2,3,4],min_length=1,max_length=7)
    revision_day: int = Field(default=5,ge=0,le=6)
    @field_validator('availability')
    @classmethod
    def days(cls,v):
        if any(x<0 or x>6 for x in v): raise ValueError('Invalid weekday')
        return sorted(set(v))
    @model_validator(mode='after')
    def study_day(self):
        if not set(self.availability)-{self.revision_day}: raise ValueError('Choose a study day other than your revision day')
        return self

class LessonInput(BaseModel):
    id: str | None = None
    title: str = Field(min_length=1,max_length=200)
    minutes: int = Field(default=45,ge=5,le=480)
    difficulty: int = Field(default=1,ge=1,le=5)
class ModuleInput(BaseModel):
    id: str | None = None
    title: str = Field(min_length=1,max_length=200)
    lessons: list[LessonInput] = Field(default=[],max_length=100)
class CurriculumInput(BaseModel):
    modules: list[ModuleInput] = Field(max_length=60)
    document_ids: list[str] = Field(default=[],max_length=20)
class GenerationInput(BaseModel):
    document_ids: list[str] = Field(default=[],max_length=20)
    instruction: str = Field(default='',max_length=3000)
class TaskInput(BaseModel):
    title: str = Field(min_length=1,max_length=200)
    description: str = Field(default='',max_length=5000)
    course_id: str | None = None
    due_date: date | None = None
    priority: Literal['Low','Medium','High'] = 'Medium'
    minutes: int = Field(default=30,ge=1,le=1440)
    status: Literal['To Do','In Progress','Completed'] = 'To Do'
class BlockInput(BaseModel):
    date: date
    title: str = Field(min_length=1,max_length=200)
    minutes: int = Field(ge=1,le=480)
    completed: bool = False
class ScheduleInput(BaseModel):
    start: date = Field(default_factory=date.today)
class FeedbackInput(BaseModel):
    response: Literal['understand','explain','practice']
class NoteInput(BaseModel):
    category: Literal['Important','Question','Remember','Example']
    content: str = Field(min_length=1,max_length=12000)
    indexed: bool = False
class QuizInput(BaseModel):
    lesson_id: str | None = None
    document_ids: list[str] = Field(default=[],max_length=20)
    kind: Literal['daily','weekly','revision'] = 'daily'
    count: int = Field(default=5,ge=1,le=30)
class AttemptInput(BaseModel):
    answers: dict[str,str]
class QuestionModel(BaseModel):
    lesson_id: str
    prompt: str = Field(min_length=5,max_length=3000)
    kind: Literal['mcq','true_false','short_answer','explanation','scenario','code']
    options: list[str] = Field(default=[],max_length=6)
    answer: str = Field(min_length=1,max_length=6000)
    explanation: str = Field(min_length=1,max_length=6000)
    concept: str = Field(min_length=1,max_length=200)
class QuizGenerated(BaseModel):
    title: str
    questions: list[QuestionModel] = Field(min_length=1,max_length=30)
class ChatInput(BaseModel):
    message: str = Field(min_length=1,max_length=6000)
    mode: Literal['strict','research'] = 'strict'
    document_ids: list[str] = Field(default=[],max_length=20)
class TitleInput(BaseModel):
    title: str = Field(min_length=1,max_length=200)
class AskInput(BaseModel):
    query: str = Field(min_length=1,max_length=6000)
    document_ids: list[str] = Field(default=[],max_length=20)
    completed_only: bool = False
class ExportInput(BaseModel):
    title: str = Field(default='Study guide',min_length=1,max_length=200)
    kind: Literal['Study Guide','Revision Guide','Lesson Notes','Weekly Review','Quiz','Test','Curriculum','Learning Roadmap','Flashcards'] = 'Study Guide'
    document_ids: list[str] = Field(default=[],max_length=20)
    lesson_id: str | None = None
class SettingsInput(BaseModel):
    provider: Literal['groq','openai','gemini'] = 'groq'
    model: str = Field(min_length=1,max_length=120)
    api_key: str | None = Field(default=None,max_length=500)
    theme: Literal['dark','light'] = 'dark'
    weights: dict[str,float] = {'quiz':.35,'weekly':.35,'revision':.2,'completion':.1}
    @field_validator('weights')
    @classmethod
    def weights_valid(cls,v):
        if set(v)!={'quiz','weekly','revision','completion'} or any(x<0 or x>1 for x in v.values()) or abs(sum(v.values())-1)>0.001: raise ValueError('The four mastery weights must total 1')
        return v

# Public response contracts intentionally exclude password hashes, keys and file paths.
class UserOutput(BaseModel):
    id: str
    email: str
    name: str

class HealthOutput(BaseModel):
    status: str
    database: str
    research_available: bool

class CourseOutput(CourseInput):
    id: str
    created_at: str
    lesson_count: int = 0
    completed_count: int = 0

class SettingsOutput(BaseModel):
    provider: str
    model: str
    theme: str
    weights: dict[str,float]
    api_key_configured: bool
    research_available: bool

class DocumentOutput(BaseModel):
    id: str
    course_id: str
    source_name: str
    page_count: int
    content_type: str
    status: str
    created_at: str
    version: int
    chunk_count: int

class SourceOutput(BaseModel):
    id: str
    document_id: str
    source_name: str
    excerpt: str
    content_type: str
    course_id: str
    page: int | None = None
    chapter: str | None = None
    section: str | None = None
    subsection: str | None = None
    module_id: str | None = None
    lesson_id: str | None = None
    linked_lesson_id: str | None = None
    course_title: str | None = None
    module_title: str | None = None
    lesson_title: str | None = None
    similarity: float | None = None

class AnswerOutput(BaseModel):
    answer: str
    sources: list[SourceOutput]
    grounded: bool
    extractive: bool = False
