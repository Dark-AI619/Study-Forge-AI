# StudyForge specification audit

Audit date: 2026-09-20. The three supplied specifications were reviewed together.
The third directive supersedes the earlier Streamlit frontend and approximate file
layout. The owner's later proprietary-license correction supersedes the earlier
suggestion to add MIT. The GitHub frontend remains the code baseline; the Stitch
references remain the visual authority.

**Release assessment:** the local platform is implemented and tested. The complete
live-AI and public-production Definition of Done is **not yet satisfied**. A configured
AI account and a Python-capable persistent host are still required. Local fixture
tests are explicitly distinguished from live-provider and production evidence.

Legend: **Verified** = exercised locally through tests/browser; **Implemented** =
present with the stated verification limit; **Pending** = not completed;
**Superseded/optional** = addressed by a later instruction or permitted limitation.

## Specification 1 — original product requirements

| Requirement | Status and evidence / limit |
| --- | --- |
| Product learning loop | Verified through backend integration fixtures; real-provider end-to-end run pending. Browser covers the non-provider path. |
| Python, modular services, SQLite, FAISS | Verified. `backend/app` separates configuration, persistence, auth, AI, RAG, learning, chat, PDFs. |
| Streamlit preference | Superseded by React/TypeScript/Vite + FastAPI in specification 3. |
| AI abstraction and missing-key handling | Implemented `AIProvider`, compatible chat adapters, structured output validation; missing/rejected keys, rate limits and malformed output tested. Live credentials pending. |
| Dashboard: date, active course, next lesson, duration, blocks, tasks, progress, revision, recent score | Verified data-backed UI. Empty states replace simulated metrics. |
| New Topic: goal, level, style, duration, availability, revision day, resources | Verified form/API. Creation now requests an editable proposal; no-key users can import detected headings or build manually. |
| Persistent course/module/lesson hierarchy, IDs and editing | Verified create/edit/reorder/remove/save, completion preservation and foreign-ID rejection. |
| Curriculum table of contents and progress | Verified Curriculum shows modules/lessons and distinct completion/mastery. |
| Scheduling budgets, sequence, multi-part sessions, configurable days | Verified tests enforce daily limits, default rest day and block types. Explicit lesson minute estimates drive allocation; difficulty is retained with lesson metadata. |
| Manual timetable editing / unfinished reschedule / weak review | Verified APIs and controls. Replanning preserves completed history and avoids repeating completed minutes. Adaptation is applied when the user regenerates the timetable; no autonomous background scheduler. |
| Today lesson objectives, prerequisites, explanation, examples, terminology, exercises, mistakes, summary, checks, sources | Implemented validated lesson schema/UI. Browser source-reading fallback verified; rich AI teaching tested with fixture output, live quality pending. |
| Understand / explain / practice feedback | Verified persisted confidence, completion and revision effects; browser confirmed feedback. |
| Six quiz question types and studied-only generation | Implemented MCQ, true/false, short answer, explanation, scenario and code schemas/UI. Integration exercises MCQ and subjective grading. All six with real models remain pending. |
| Question-level answers, rubrics, score, explanations, weak concepts | Verified persisted attempts/answers and result display contracts; live browser quiz generation pending key. |
| Targeted revision and cumulative weekly tests | Verified separate daily/weekly/revision components, weak concepts, recurring due dates and score effects. Generation needs AI. |
| Completion distinct from configurable mastery | Verified centralized 35/35/20/10 weights. Browser: completing the only lesson yields 100% completion, 10% mastery. |
| Task fields, CRUD, statuses and independence from mastery | Verified API lifecycle and browser creation/completion/reopen after restart. |
| PDF/TXT/MD ingestion, metadata, FAISS, persistent vectors | Verified real PDF + local model tests and browser upload; no simulated embedding/index implementation. |
| Cross-course and selected-document isolation | Verified unrelated Machine Learning/Mandarin fixtures and source selection before vector search. Curriculum, lessons, quizzes and exports preserve requested scope. |
| Strict Course Mode, insufficient evidence, citations | Verified no-key source excerpts and AI citation fixtures; IDs/quotes checked against evidence. Semantic correctness still requires live assessment. |
| Research Mode and provenance | Permitted limitation: visibly unavailable; separate mode and provenance table exist. No external research connector implemented. |
| Categorized lesson notes, optional indexing and type separation | Verified Important/Question/Remember/Example storage; searchable notes labeled personal. Unindexed notes can export to PDF. |
| Knowledge search with course/module/lesson/source | Verified scoped search. Responses include available hierarchy context; unmapped uploaded passages do not fabricate lesson associations. |
| Adaptive priority | Verified understandable score/confidence/elapsed-time heuristic and focused review queue. It is a heuristic, not a measured optimal learning algorithm. |
| SQLite initialization, relationships and restart persistence | Verified schema initialization/migrations, foreign keys, UUIDs, subprocess restart and actual server restart fingerprint checks. |
| Reliability, safe uploads, parameterized SQL, secrets | Verified malformed files/JSON, missing indexes, scope errors, key encryption, cross-user access, origin checks and secure production cookie flags. Not a comprehensive security penetration test. |
| Automated tests, local execution, documentation | Verified test suite, clean npm install, TypeScript and build. README includes Windows commands and environment setup. |

## Specification 2 — continuation (sections 1–30)

| Sections | Requirement / outcome |
| --- | --- |
| 1 | Study AI page: history, messages, new chat, rename/delete, course/mode/document selection, attachments, sources, errors/loading. Browser chat persistence and source replies verified. |
| 2–3 | PDF-to-learning plan and learning-guide commands: source extraction/index → editable curriculum → timetable → lessons/quizzes/revision. Backend action fixtures pass; natural-language coverage and teaching quality pending live provider. |
| 4–5 | Reliable document structure and one RAG pipeline: explicit headings/pages retained, metadata and real FAISS tested. No fabricated PDF outline or second retrieval service. |
| 6–7 | Strict and Research modes: strict path verified; research explicitly unavailable as permitted. |
| 8 | Chat application actions invoke real services. Curriculum replacement is reviewed before saving; actions create actual tasks, schedules, quizzes, lessons and files. Chat operates in the selected course; new courses are created through New Topic. |
| 9 | Chat sessions/messages/attachments/actions persist with sources and timestamps; rename/delete endpoints and ownership checks implemented. |
| 10–11 | Valid PDF generation and Markdown export verified. Study/revision guides, lesson notes, weekly review, quiz/test, curriculum/roadmap, flashcards are supported export types. Composed AI documents need a key. PDFs use a readable basic layout, not advanced typesetting. |
| 12 | Document library metadata, original download, move, remove, re-index implemented/tested. Deletion removes vectors; unchanged re-index preserves citation IDs and note links, including duplicate text. |
| 13 | Generated Files stores title/type/course/date/sources and serves real authenticated PDF/MD downloads. Browser download and rendered PDF verified. |
| 14 | Requested document scope is enforced in retrieval and carried into curriculum, lesson, quiz and composed export inputs. Generated claims cannot be mathematically guaranteed by citation checks. |
| 15 | Bounded history and sampled source/lesson context; entire books are not repeatedly sent. Character budgets approximate tokens; exact vendor token counting/summarization is not implemented. |
| 16–17 | Editable table of contents and timetable preferences persist. Curriculum proposals require review before a potentially destructive replacement. |
| 18–19 | Repository includes README, requirements, configuration, tests, deployment docs and exclusions for private/runtime data. Duplicate archive and unused mockup dialogs removed. |
| 20 | Superseded: proprietary All Rights Reserved notice, Hannan Malik (韩文昊), `UNLICENSED` package metadata; third-party licenses remain intact. |
| 21–22 | Fresh setup commands, model setup command, empty-state startup and idempotent database initialization implemented. Clean npm install verified; Docker/fresh Linux setup pending. |
| 23–24 | Real PDF workflow and Study AI integration tests plus browser interactions performed. Live AI and public-host testing remain pending credentials/access. |
| 25 | Existing landing identity and completed services preserved; fixes extend the current repository. |
| 26–27 | All requested sidebar pages and persistent learning loop implemented; no administration/payment/social scope added. |
| 28 | Updated Definition of Done partially verified locally; not fully complete until the real-provider and deployed workflows pass. |
| 29–30 | Authorized engineering continuation followed: inspect, test, fix, build, browser QA, document and prepare deployment. No unfinished static mockup published. |

## Specification 3 — final platform directive (sections 1–50)

| Sections | Requirement / outcome |
| --- | --- |
| 1–3 | Existing GitHub React frontend retained; FastAPI/SQLite/FAISS added. Stitch typography, palette, logo/book imagery, surfaces, gradients and landing structure preserved. |
| 4–5 | Public `/` and separate `/app` with all 12 requested routes, persistent desktop sidebar and mobile drawer verified. |
| 6 | Complete learning loop implemented; provider-dependent parts proven with test fixtures, not yet against live AI. |
| 7–8 | Real Study AI action orchestration and full chat controls. Model action selection is allowlisted; no arbitrary code/SQL execution. |
| 9–13 | Persistent PDF learning material, structure, local embeddings, FAISS, scoped metadata and unrelated-course isolation tested. OCR and advanced layout extraction are not implemented. |
| 14 | Provider abstraction and three adapters implemented; per-user server-side encrypted keys. Live integration remains pending. |
| 15 | Required state persisted; `blocks` combines schedule/learning-block storage. `questions`, `attempts`, `answers` represent quiz tables. No relationship depends on titles. |
| 16 | Curriculum generation/editor/TOC/completion with stable IDs. Saved chat proposals populate Curriculum and Today. |
| 17 | Real schedule generation, defaults/custom days, time budgets, weak revision and manual editing. User-triggered replanning applies adaptation. |
| 18 | Today learning content, source display, notes, completion and feedback implemented; browser source-reading path verified. |
| 19–21 | Quiz history, targeted revision, cumulative weekly tests and separate configurable mastery verified through integration tests. Live model evaluation remains pending. |
| 22–24 | Tasks, categorized searchable notes and scoped knowledge search implemented and verified. |
| 25 | Actual PDF and MD generation/downloads; personal notes export includes unindexed notes. AI guide quality and complex multilingual/math layout remain unverified. |
| 26–27 | Dashboard and Progress use stored state, assessment history, study-block minutes and per-lesson mastery. Module completion/mastery appears in Curriculum; weak topics/revision state in Revision. No streak metric invented. |
| 28 | Unsupported performance/user-count statistics and simulated interactions removed or replaced with clearly labeled examples and real feature descriptions. |
| 29–30 | FastAPI request validation, explicit public response models for auth/settings/courses/documents/RAG, centralized TypeScript client and service boundaries. Dynamic action/learning responses use typed frontend contracts and integration validation. |
| 31–34 | Loading/errors/empty states and accessible semantic controls; responsive desktop/mobile verified, local setup commands and same-origin build serving documented. Full assistive-technology audit not performed. |
| 35–36 | Clean repository exclusions, proprietary LICENSE, complete README, architecture/environment/RAG/security/troubleshooting/deployment documentation. |
| 37–38 | Backend tests, clean dependency install, typecheck, build, real browser workflows, rendered PDF and restart verification performed. Real-provider full end-to-end and production checks pending. |
| 39–40 | Graceful failures and honest unavailable states; no fake AI, RAG, progress, uploads or downloads in production code. Test LLM fixtures remain confined to tests. |
| 41–43 | Personal-first onboarding collects requested preferences and material, then requests an editable curriculum proposal. No enterprise/school/payment expansion. |
| 44 | Cached local model, persisted vectors/indexes, bounded source context, lazy workspace routes, reduced-motion rules. Runtime data/backend files excluded from frontend file watching. |
| 45–48 | Intended experience is implemented; full Definition of Done remains conditional on live AI credentials and production hosting. See acceptance checklist below. |
| 49–50 | Current status, run commands, tests, limitations and deployment steps documented; existing work continued without restarting the project. |

## Final deployment addition and Definition of Done gates

| Deliverable / gate | Status |
| --- | --- |
| Functional React/TypeScript/Vite frontend | Verified locally, including compiled build served by FastAPI. |
| Functional FastAPI backend, SQLite, FAISS/RAG | Verified locally with real PDF embeddings/index retrieval and persistence. |
| User-supplied AI-key option | Implemented and encryption/error behavior tested; no live key supplied. |
| Production environment handling and build configuration | Implemented, build/typecheck pass; HTTPS origins and encryption-key requirements tested. |
| Durable production storage design | Prepared: one service + persistent disk, SQLite backup command and recovery instructions. No ephemeral-storage assumption. |
| Updated GitHub repository | Implementation branch/PR delivery; see the delivery record rather than assuming main has been merged. |
| Complete deployment README | Present, with platform instructions, environment variables, backup and production checklist. |
| Docker build / host deployment | Pending. Docker unavailable locally; no connected Python host provisioned. |
| Live AI curriculum, teaching, chat actions, daily/weekly/revision quizzes and guide generation | Pending valid provider credentials. Fixture tests do not satisfy this live gate. |
| Public HTTPS URL and tests against it | Pending host access. No public application URL claimed. |
| Production refresh/restart/redeploy persistence | Pending host. Local actual-process restart and backup integrity verified. |
| Cloud restore rehearsal / production capacity testing | Pending host; not inferred from local results. |

The platform is a verified local candidate, **not a declared production release**.
The two external prerequisites are a working provider account/key and approved hosting
access. Remaining engineering limits are explicit: no Research connector/OCR, no exact
token accounting, no autonomous background scheduling, no multi-instance coordination,
basic PDF typesetting, no password recovery/email verification, and no comprehensive
browser/accessibility/security/load audit. These should not be represented as working
features in a production announcement.
