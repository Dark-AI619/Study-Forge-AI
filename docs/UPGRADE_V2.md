# StudyForge v2 upgrade record

2026-09-28. Continues the existing codex/studyforge-platform application. No framework, provider, database or vector-store replacement.

## Implemented

- Account-scoped active course, asynchronous UI state guards, logout/session-expiry reset, profile preferences and persisted reduced-motion choice.
- Preferences feed the existing shared provider (language, depth, tone, quiz/style/intensity); daily minutes shape additive assistant tasks and revision blocks. Existing schedules remain explicit course settings. Personalization can be disabled.
- Public-reference Research Mode uses Wikipedia HTTPS search and extracts, labels external versus course evidence, checks citation IDs and exact quotes, and uses the existing AI provider for synthesis. Without a key it honestly returns references. This is not a comprehensive web or scholarly search.
- Research can be saved as indexed documents; it is excluded from default strict retrieval and curriculum source outlines. Explicit document selection permits it. Assistant topic additions preserve supplied research as lesson material; a supplied lesson ID also attaches a saved note to that lesson.
- Persistent floating assistant, course-scoped conversations, page context, existing provider/RAG reuse, expansion and keyboard dismissal. Typed action proposals for tasks, notes, topics, schedule moves, quizzes, due-concept revision sessions, additive study plans, PDF guides, navigation and task deletion. Every action requires confirmation, is owner-checked, audited and protected against replay. Interrupted operations become uncertain rather than retrying writes.
- Duplicate document SHA-256 protection within a course. Markdown external images are suppressed, unsafe source links withheld, generic failure logging avoids provider/query payloads, assistant requests are rate bounded.
- Restrained component motion and CSS perspective learning-path cards based on real completion/mastery, with mobile and reduced-motion fallbacks. No added WebGL runtime.

## Persistence configuration

Railway project dependable-smile, service Study-Forge-AI. Volume study-forge-ai-volume (e8ea1560-9609-4965-aad0-4c1b53caf3fc), mounted at /var/data; STUDYFORGE_DATA_DIR=/var/data/studyforge. Console confirmed os.path.ismount('/var/data') is True and SQLite exists underneath. Existing data was explicitly disposable. The previous deployment had no volume; its synthetic records were not migrated.

Production now refuses to start on Railway if the real volume is missing or the configured data directory is outside it. SQLite, uploads, vectors/indexes, generated files and conversations share the durable data root. The embedding model remains in the image cache. The production encryption secret stays in Railway variables; no keys are included in this repository. A final live restart survival check is still required at time of this commit.

## Verification before deployment

- Complete backend suite: 43 passed (39.71s), including real local embedding/FAISS tests. Two dependency deprecation warnings.
- TypeScript `npm run lint`: passed. Vite production build: passed.
- Initial JS approximately 295 kB / 90 kB gzip; assistant separately loaded, approximately 8.5 kB / 3 kB gzip.
- Local real browser: account creation, global assistant and actual Wikipedia reference retrieval verified without a provider key.
- Existing CI runs the same checks and a Linux Docker build. Docker CLI is unavailable on this Windows host; Railway builds the deployment image.

## Deliberate limits

Background notifications, bulk account export/deletion and general search beyond Wikipedia are not implemented. Study hours guide AI planning but the existing timetable stores dates rather than clock times. Assistant learning plans create dated tasks; they do not overwrite the course timetable. CSS visual depth is used instead of heavy WebGL. A valid owner-supplied provider key is needed for final live synthesis, quiz and study-guide acceptance; fixtures do not establish live model quality.

Earlier SPECIFICATION_AUDIT.md and VERIFICATION.md describe the baseline release; this record supersedes their statements that Research Mode and hosting are unavailable. See the final task report for deployed SHA and post-deployment acceptance evidence.
