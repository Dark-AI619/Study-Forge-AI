# Verification record

Date: 2026-09-20. Windows, Python 3.11, Node 24.19, npm 12.0.2.
This records local execution, not a production deployment.

## Automated and build results

| Check | Result |
| --- | --- |
| Initial continuation baseline | 23 backend tests passed; TypeScript passed. |
| Final `python -m pytest backend/tests -q` | **29 passed**, 19.67 seconds. |
| `npm run lint` | Passed (`tsc --noEmit`). |
| Clean dependency installation | Passed, 147 packages installed from the lockfile. |
| npm dependency audit | 0 known vulnerabilities reported for 148 audited packages. |
| Final `npm run build` after clean install | Passed, 207 modules; lazy workspace/page bundles generated. |
| `git diff --check` | Passed; Windows line-ending notices only. |
| Package/root lockfile consistency | Matching name/version/dependencies and proprietary `UNLICENSED` metadata. |
| API health and compiled routes | HTTP 200 for `/api/health`, `/`, `/app/today`, and book artwork through FastAPI. |

Two upstream test-client deprecation warnings remain (`httpx`/Starlette and an AnyIO
alias). They did not fail tests; no application exceptions were hidden as passes.
Dependency audits report known advisories only, not a security guarantee.

The clean npm command on this npm 12 installation was:

```sh
npm ci --ignore-scripts --registry=https://registry.npmjs.org --allow-remote=all
```

All locked package download hosts were checked and were `registry.npmjs.org`.
The per-command remote option was needed for Tailwind's optional WASM tarball URL;
no global npm setting was changed. Typecheck and Vite build passed afterward.

## Automated coverage

The suite exercises database initialization; course creation; curriculum IDs and
completion preservation; task lifecycle; schedule budgets, sequence, rest day,
history and completed-minute preservation; mastery weights; revision priority and
recurrence; key encryption and missing-key behavior; auth/ownership/origin boundaries;
upload validation; real PDF extraction; real Sentence Transformer embeddings; FAISS
retrieval, cross-course/document isolation, missing/corrupt-index recovery, removal
and re-indexing; selected scope persistence; note relationships and repeated passage
IDs; chat persistence and application actions; quiz attempts/grading and distinct
weekly/revision scores; actual PDF/Markdown creation/download; unindexed personal-note
PDFs; subprocess persistence; malformed model output; fabricated citation rejection;
provider HTTP error handling; public response contracts; production HTTPS/encryption
requirements and Secure/HttpOnly/SameSite cookie flags.

AI responses/grading in integration tests use an explicit deterministic fixture.
Provider transport failures use mocked HTTP responses. Neither is a live provider
test. Embeddings, FAISS, SQLite, PDF extraction and PDF generation are real.

## Browser workflows actually performed

Used the connected in-app browser against Vite on port 3000 and the built application
served by FastAPI on port 8000. Disposable local QA data was used; none is in Git.

- Opened the application, registered a QA account and created a learning goal/course.
- Uploaded an educational PDF through the file chooser; observed 1 page, 3 passages,
  and Indexed status. An internet-check delay was discovered and fixed by explicit
  offline runtime model loading.
- Asked Knowledge about overfitting, inspected source excerpts, page 1 and section
  attribution. The no-key extractive response was clearly labeled.
- Selected the PDF, imported its detected headings as an editable proposal, edited
  the lesson title, saved the curriculum, and generated a timetable.
- Inspected concept/break/example/practice/quiz/review blocks and Saturday review/test.
- Prepared and opened a source-reading lesson, completed a learning block, wrote and
  indexed a personal note, and requested more practice.
- Verified the revision item appeared. Attempting a revision quiz without a key
  displayed the expected actionable message instead of inventing questions.
- Sent two Study AI questions and reopened the saved conversation, with source replies.
- Created a task, changed it to Completed, and later reopened it after server restart.
- Generated a curriculum PDF, triggered the browser download, confirmed the file on
  disk and its PDF contents, rendered it and visually inspected the resulting page.
- Opened Settings, confirmed the provider/model/API-key controls, saved a light theme,
  inspected its rendering and restored the Obsidian dark theme.
- Completed the lesson and observed 100% completion versus 10% mastery, with assessment
  components remaining zero because no real-provider quizzes had been taken.
- Inspected desktop landing/workspace screenshots and a 390×844 mobile viewport;
  checked mobile navigation, Progress, Generated Files and landing layout. At the
  tested width, document width was 385 px within a 390 px viewport.
- Opened the mobile landing menu and navigated through AI Setup to real Settings.
- Checked compiled-app browser logs: no warnings/errors returned during that check.

These are targeted browser checks, not a claim that every control or every viewport
has been exhaustively tested. A real-browser quiz-taking session remains pending AI
credentials; quiz/weekly/revision integration is covered by backend fixtures.

## Persistence and backup

Recorded hashes of all rows in 17 application tables and 6 runtime artifact files,
stopped the actual backend process, started it again and compared the fingerprints.
All records and files matched. The browser then reopened the saved task, lesson,
completed block and note through the compiled application.

The checked local data contained 1 course, 1 module, 1 lesson, 18 blocks, 1 task,
2 documents, 4 chunks, 1 mastery row, 1 revision item, 1 note, 1 conversation with
4 messages, and 1 generated file. Quiz attempts existed in isolated integration
test databases; their subprocess persistence is tested separately.

Executed `backend/backup.py` into a new directory outside live data. SQLite reported
`integrity_check: ok`; all copied upload/index/generated-file hashes matched. No
live data was overwritten to simulate a restore. Cloud restore rehearsal is pending.

## Explicitly not verified

- Live Groq/OpenAI/Gemini generation, grading, action interpretation, quotas or latency:
  no provider key was configured in the QA account.
- Docker image build/run: Docker executable unavailable on this machine.
- Public HTTPS deployment, hosted CORS/cookies, cold starts, actual disk mounts,
  redeployment durability, production PDF download, or production load: no host.
- OCR, Research Mode, multilingual retrieval/PDF quality, full accessibility audit,
  cross-browser matrix, penetration testing or horizontal scaling.

The production acceptance checklist is in [DEPLOYMENT.md](DEPLOYMENT.md).
