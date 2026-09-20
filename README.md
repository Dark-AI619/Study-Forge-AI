# StudyForge Platform

StudyForge connects a learning goal and your own material to an editable course,
study timetable, lessons, quizzes, revision, tasks, and a searchable knowledge library.
The existing React landing page and Stitch visual direction are preserved.

**Status:** functional local release candidate. Production build and local verification
are complete; a public deployment and live AI-provider verification are pending.
Read the [specification audit](docs/SPECIFICATION_AUDIT.md) and
[verification record](docs/VERIFICATION.md) for the exact scope and limitations.

## What works

- Public landing page and responsive, authenticated workspace with all 12 requested sections.
- Course onboarding; editable modules and lessons; curriculum/table of contents.
- Configurable daily budgets and study days, learning blocks, weekly review/test slots,
  manual timetable editing, and rescheduling of unfinished work.
- PDF/TXT/Markdown ingestion, local embeddings, persistent FAISS indexes, scoped search,
  source passages, page references, document re-indexing and removal.
- Persistent Study AI conversations, source selection, and service actions for learning
  plans, lessons, quizzes, tasks, revision, schedules, and PDF exports.
- Question-level quiz history, separate completion/mastery, confidence feedback,
  targeted revision, searchable personal notes, and real progress metrics.
- Encrypted, per-user AI keys entered in Settings; Groq, OpenAI, and Gemini adapters.
- Real PDF and Markdown exports, including a curriculum export that needs no AI key.

Without an AI key, course/task management, source reading/search, detected-heading
curriculum import, scheduling, and curriculum PDFs remain usable. These fallbacks are
labeled clearly. AI teaching, generated quizzes/grading, chat actions and composed
study guides require a working provider key. Research Mode is explicitly unavailable.

## Architecture

```text
React / TypeScript / Vite / React Router
            │ same-origin /api requests + HttpOnly session cookie
FastAPI / Pydantic → learning, chat, AI, RAG, document services
            │
SQLite (authoritative state + metadata + saved vectors)
FAISS (derived per-course search indexes)
Durable filesystem (uploaded and generated files)
```

The production server serves both the Vite build and API. One process/worker is
intentional for local index locking and SQLite. No Streamlit or second frontend.

```text
src/components/       Existing landing-page components
src/app/pages/        Dashboard, Today, Study AI, Curriculum, Timetable,
                      Knowledge, Quizzes, Revision, Tasks, Progress, Files, Settings
src/api/client.ts     Centralized typed API client
backend/app/          Configuration, database, auth, AI, RAG, learning, chat, PDF services
backend/tests/        Isolated database tests, real embeddings, integration fixtures
backend/setup_model.py
public/assets/        Existing StudyForge logo and knowledge-book artwork
Dockerfile            React build + Python runtime
render.yaml           Proposed persistent-disk deployment
compose.yaml          Local container configuration
```

## Windows setup (PowerShell)

These instructions are for the owner and other users with permission under LICENSE.
Use Python 3.11 and Node.js 24. Run commands from the repository root.

```powershell
git clone https://github.com/Dark-AI619/Study-Forge-AI.git
cd Study-Forge-AI
# If the implementation PR has not been merged:
git checkout codex/studyforge-platform
py -3.11 -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
npm ci
Copy-Item .env.example .env
backend/.venv/Scripts/python backend/setup_model.py
```

The initial model download needs internet access and disk space. Subsequent document
indexing loads the cached model offline. Do not commit the model or runtime data.
Direct Python dependencies are pinned to tested versions; npm dependencies have a
lockfile. Transitive Python versions may vary across platforms.

Start the API in one terminal:

```powershell
backend/.venv/Scripts/python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Start Vite in a second terminal:

```powershell
npm run dev
```

Open http://127.0.0.1:3000. Create a local account, create a topic, and add sources.
Vite forwards `/api` to FastAPI. Keep the host consistent: localhost and 127.0.0.1
have separate cookies. The database and runtime directories initialize automatically.

For a single-server local preview of the production build:

```powershell
npm run lint
npm run build
# Stop and restart the API if it was started before dist/ existed.
backend/.venv/Scripts/python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000. Vite is not needed for this mode.

On Linux/macOS, create the venv with `python3 -m venv backend/.venv` and replace
`backend/.venv/Scripts/python` with `backend/.venv/bin/python` in these commands.

## Configure AI in the application

1. Open Settings, choose a provider, and confirm a model available to your account.
2. Enter your own API key in the password field and save.
3. Use **Test saved connection**. A saved key alone does not prove provider access.
4. Generate a curriculum or lesson, then take a quiz to validate your chosen model.

The backend encrypts keys with Fernet. APIs return a configured flag, never the key.
The selected provider receives the prompts and relevant source excerpts needed for
an AI request. Local embeddings do not send documents to an embedding API.
Provider quotas/billing are controlled by your provider account.
Never put a provider key in a `VITE_` variable or commit it to Git.

Defaults can be edited in Settings. Provider availability changes; consult the official
[Groq model list](https://console.groq.com/docs/models),
[OpenAI model documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini),
and [Gemini compatibility documentation](https://ai.google.dev/gemini-api/docs/openai).

## Environment configuration

| Variable | Purpose / default |
| --- | --- |
| `ENVIRONMENT` | `development` locally; `production` for HTTPS hosting. |
| `ALLOWED_ORIGINS` | Comma-separated exact frontend origins, no trailing slash. Production requires HTTPS origins. No wildcard. |
| `STUDYFORGE_DATA_DIR` | Defaults to repository `data/`; production must use a durable disk path. |
| `EMBEDDING_MODEL` | Defaults to `sentence-transformers/all-MiniLM-L6-v2`. Keep fixed for an existing data directory. |
| `EMBEDDING_CACHE_DIR` | Defaults to `DATA_DIR/models`; Docker preloads `/opt/studyforge-models`. |
| `ENCRYPTION_KEY` | Required, stable Fernet key in production. Local development creates `data/encryption.key`. |
| `REGISTRATION_INVITE_CODE` | Optional local invitation; recommended for a personal public deployment. |
| `VITE_API_BASE_URL` | Public build-time value; `/api` for the supported same-origin deployment. |
| `PORT` | Container listening port, default 8000. The host provides it on Render. |

Generate an encryption key locally, then store it in the host's secret configuration:

```powershell
backend/.venv/Scripts/python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Do not rotate or lose the encryption key without a migration/re-entry plan; encrypted
provider keys depend on it. Production cookies require HTTPS. Separate unrelated
frontend/backend domains are not supported by the default SameSite cookie policy;
use the single-origin configuration or a same-origin reverse proxy.

## RAG and persistence

Text-bearing PDFs (up to 20 MB and 1,500 pages), UTF-8 TXT, and Markdown are supported.
Extraction preserves available pages and explicit headings; it does not invent book
structure. Scanned/encrypted or unreadable PDFs return an actionable error; OCR is not
implemented. Large documents are bounded by an extracted-text cap.

Chunks retain course/document IDs, pages, sections, type, version and applicable
lesson/module links. Sentence Transformers produces normalized vectors. FAISS searches
only the active course and requested document scope. SQLite stores metadata and
vector bytes, allowing missing/corrupt indexes to rebuild without re-embedding.
Re-indexing unchanged passages preserves their source IDs and note links.
Strict answers require verified source IDs and exact quoted evidence; insufficient
material returns an explicit refusal. Citation checks do not prove every generated
claim is correct; review high-impact study content against the original source.

Runtime data is excluded from Git: `data/studyforge.sqlite3`, uploads, indexes,
generated PDFs/Markdown, model cache, and local encryption key. Course deletion
removes linked data. Document removal rebuilds the course index. Existing messages
retain historical citation snapshots; a deleted source can no longer be downloaded.
A curriculum referencing a removed/moved source must be edited to select its new scope.

Do not change the embedding model for an existing populated directory without a
planned full re-index/migration. Mixed embedding models are not a supported deployment.

## Testing

```powershell
backend/.venv/Scripts/python -m pytest backend/tests -q
npm run lint
npm run build
npm audit
```

Download the model first. Tests use temporary databases and real local embeddings;
LLM output fixtures are deterministic and confined to tests. They are not a production
AI fallback and do not establish live-provider quality or connectivity.

The [verification record](docs/VERIFICATION.md) records browser workflows, PDF rendering,
restart checks, and the remaining production acceptance steps.

## Deployment and backup

See [deployment instructions](docs/DEPLOYMENT.md). The proposed host is one Docker
service with a persistent disk, serving both frontend and backend. A static-only
site or ephemeral serverless filesystem is insufficient for this architecture.
No public deployment or production HTTPS URL has yet been provisioned.

## Troubleshooting and security

- **Backend unreachable:** check port 8000, API health, and the Vite proxy. Error messages
  distinguish offline API, validation errors, and missing provider credentials.
- **Embedding model unavailable:** run `backend/setup_model.py` with the same model/cache
  environment as the API; runtime deliberately does not download missing model files.
- **Provider rejected key/model:** update Settings and test the saved connection; check
  provider quota and model access. Provider errors do not expose raw vendor responses.
- **Upload unreadable:** use a text-bearing PDF or UTF-8 TXT/MD; split oversized files.
- **Production 403 / lost login:** ensure exact HTTPS `ALLOWED_ORIGINS`, same-origin API,
  and persistent sessions; never set wildcard credentialed CORS.
- **Blank deployment route:** build `dist/` before starting FastAPI. Its fallback serves
  nested React routes while unknown `/api/` routes remain API 404s.
- **Lost AI key after move:** restore the original encryption secret or re-enter the key.

Passwords use salted PBKDF2 hashes; sessions are hashed in SQLite and use HttpOnly
cookies. Production cookies are Secure. Requests enforce origin checks; uploads are
bounded and never executed. SQL is parameterized. Do not expose the development server
or public signup without evaluating the deployment/invitation settings.
This personal MVP does not include email verification, password recovery, enterprise
identity, distributed jobs/rate limits, multi-instance index coordination, or OCR.

## Proprietary software — All Rights Reserved

Copyright © 2026 Hannan Malik (韩文昊). All rights reserved.

StudyForge's source code and original project materials owned by Hannan Malik
are proprietary. StudyForge itself is **not open-source or MIT-licensed**.
Public repository visibility permits inspection for evaluation and reference
only; it does not grant a general right to use, copy, modify, reproduce,
redistribute, sublicense, sell, commercially exploit, or create derivative
works. Other permissions require Hannan Malik's explicit prior written consent,
subject to the qualifications in the [proprietary license notice](LICENSE).

Third-party libraries, frameworks, models, assets, fonts, dependencies, and
other components retain their respective licenses and required notices. They
are not relicensed by StudyForge's proprietary notice. No ownership is claimed
over third-party components or generated assets where Hannan Malik does not
own the relevant rights.

The package metadata value `UNLICENSED` identifies StudyForge's proprietary
package; it does not change the licenses of any dependencies.
