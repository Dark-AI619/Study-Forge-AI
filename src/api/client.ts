export const API = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export class ApiError extends Error { constructor(message:string,public status:number){super(message);} }
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
  let response:Response;
  try { response=await fetch(API+path,{method,credentials:'include',headers:body instanceof FormData?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)}); }
  catch { throw new Error('Cannot reach StudyForge. Check your connection and that the backend is running.'); }
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new ApiError(typeof data.detail==='string'?data.detail:Array.isArray(data.detail)?data.detail.map((x:{msg:string})=>x.msg).join('; '):'The request could not be completed.',response.status);}
  return response.json();
}
export interface Course {id:string;title:string;goal:string;level:string;style:string;weeks:number;daily_minutes:number;availability:number[];revision_day:number;lesson_count?:number;completed_count?:number;}
export interface Source {course_title?:string;module_title?:string;lesson_title?:string;linked_lesson_id?:string;id:string;document_id:string;source_name:string;page:number|null;chapter?:string;section?:string;excerpt:string;content_type:string;course_id:string;}
export interface Lesson {id?:string;module_id?:string;course_id?:string;title:string;minutes:number;difficulty:number;completed?:number;confidence?:number;mastery?:number;studied_at?:string;content?:LessonContent;sources?:Source[];}
export interface LessonContent {objectives:string[];prerequisites:string[];explanation:string;examples:string[];terminology:string[];exercise:string;common_mistakes:string[];summary:string;knowledge_check:string[];}
export interface Module {id?:string;title:string;lessons:Lesson[];completion?:number;mastery?:number;}
export interface Plan {modules:Module[];notice?:string;sources?:Source[];document_ids?:string[];}
export interface Block {id:string;course_id:string;lesson_id:string|null;date:string;kind:string;title:string;minutes:number;completed:number;position:number;}
export interface Task {id:string;course_id:string|null;title:string;description:string;due_date:string|null;priority:string;minutes:number;status:string;}
export interface Document {id:string;course_id:string;source_name:string;page_count:number;chunk_count:number;status:string;content_type:string;created_at:string;version:number;}
export interface Quiz {id:string;title:string;kind:string;score?:number;created_at:string;questions:Question[];attempts:Attempt[];}
export interface Question {id:string;prompt:string;kind:string;options:string[];concept:string;}
export interface AnswerResult {question_id:string;prompt:string;answer:string;correct_answer:string;score:number;explanation:string;concept:string;}
export interface Attempt {id:string;score:number;result:AnswerResult[];weak_concepts?:string[];}
export interface Revision {id:string;lesson_id:string;concept:string;title:string;priority:number;due_date:string;status:string;mastery:number;}
export interface Progress {lessons:(Lesson & {quiz:number;weekly:number;revision:number})[];attempts:{id:string;score:number;created_at:string;title:string;kind:string}[];study_minutes:number;completion:number;mastery:number;}
export interface Settings {provider:string;model:string;api_key_configured:boolean;theme:string;weights:Record<string,number>;research_available:boolean;}
export interface GeneratedFile {id:string;title:string;kind:string;created_at:string;sources:Source[];}
