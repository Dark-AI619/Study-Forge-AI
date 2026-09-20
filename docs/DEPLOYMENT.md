# Production deployment

## Status and release gate

No hosting account/service was supplied. The owner requested deployment preparation.
There is **no production URL and no deployed frontend/backend yet**. Local tests and
a Vite production build have passed. Docker is not installed on the verification
machine, so the image and Render deployment remain unexecuted acceptance steps.
Do not call a static frontend preview a complete deployment.

## Architecture

Use a single Docker web service with one Uvicorn worker:

- FastAPI serves `dist/`, nested React routes, and `/api` on the same HTTPS origin.
- SQLite, uploads, FAISS indexes, generated PDFs/Markdown live at
  `/var/data/studyforge`, backed by a persistent disk.
- The embedding model is downloaded while building the image to
  `/opt/studyforge-models`; this immutable cache is not hidden by the data volume.
- The host terminates TLS. `ENVIRONMENT=production` enables Secure cookies and HSTS.
- The owner controls signup through `REGISTRATION_INVITE_CODE` and supplies a stable
  `ENCRYPTION_KEY`. Each learner adds their provider key in Settings.

This is a personal, single-instance architecture. Do not add replicas/workers or
share a SQLite/FAISS directory across services. Horizontal scale needs a database,
object storage, and coordinated vector/job architecture before it is enabled.
Sites/Cloudflare static or Worker hosting alone cannot run this Python/FAISS stack.

## Render preparation

`render.yaml` describes a Docker web service on the Standard plan, one instance,
a 10 GB disk at `/var/data`, health check `/api/health`, and manual deployments.
Review current pricing and resource needs before creating the paid service.
No purchase or provisioning has been performed.

Render documents that normal service filesystems are ephemeral and only files
under the disk mount persist. Persistent disks require a paid service. See
[persistent disks](https://render.com/docs/disks),
[Docker services](https://render.com/docs/docker), and
[Blueprint configuration](https://render.com/docs/blueprint-spec).

1. Review/merge the implementation branch, or explicitly select
   `codex/studyforge-platform` as the source branch in the host.
2. Connect `Dark-AI619/Study-Forge-AI` and create the Blueprint from `render.yaml`.
3. Confirm the persistent disk is mounted at `/var/data` and instance count is one.
4. Set the secret variables when prompted:
   - `ENCRYPTION_KEY`: a generated Fernet key; keep a secure recoverable copy.
   - `REGISTRATION_INVITE_CODE`: a long random invitation string.
   - `ALLOWED_ORIGINS`: the exact assigned HTTPS origin, e.g.
     `https://YOUR-SERVICE.onrender.com`, without a trailing slash.
     Add a custom HTTPS origin if configured; never use `*`.
5. Deploy the Docker image. The host supplies `PORT`. The build downloads the local
   embedding model once; allow sufficient build time and outbound package access.
6. Check health, logs, and disk usage. Open the assigned HTTPS URL. There is one
   deployment for both frontend and backend; `VITE_API_BASE_URL=/api` is the default.
7. Complete the acceptance checklist below before sharing it as production-ready.

If the assigned hostname is not known at Blueprint creation, set `ALLOWED_ORIGINS`
after the service is created and redeploy. Startup intentionally rejects non-HTTPS
production origins. Never work around that validation by using development mode.

## Local container verification

On a machine with Docker installed:

```sh
docker compose build
docker compose up -d
docker compose logs --tail=100
```

Open `http://127.0.0.1:8000`. Compose binds to loopback and uses development cookies;
it is not a public HTTPS deployment. Data uses the named `studyforge-data` volume.
Restart with `docker compose restart` and verify retained state. Do not run
`docker compose down -v` against data you intend to keep.

## Backups and recovery

Use host disk snapshots as an additional protection, not the sole recovery plan.
Make an independent backup before migrations/deploys and regularly thereafter.
Stop user writes/uploads during backup; this version has no background job writers.

From the repository root, with the same data-directory environment as the API:

```powershell
backend/.venv/Scripts/python backend/backup.py C:/StudyForgeBackups/2026-09-20
```

In the container, use `python backend/backup.py /var/data/backups/UNIQUE-DATE`.
Download/copy that backup off the service disk into access-controlled storage. It
contains private learning material and account data. The command uses SQLite's
backup API, checks database integrity, and copies uploads, indexes, generated files,
and the local development encryption key when present. It rejects existing backup
directories and destinations nested inside the live data directory.

Keep the production `ENCRYPTION_KEY` separately in secure secret storage. Losing it
prevents decrypting saved provider keys. Model caches can be downloaded again.

For recovery: stop application writes/service, retain a copy of the current data,
restore the backup database and file directories to the **same absolute data path**
recorded in `manifest.json`, restore the matching encryption secret, restart, then
verify account login, PDF download, RAG retrieval, tasks, and learning results.
Stored file paths currently require that same absolute mount path. Restoring at a
different path requires an explicit path migration; do not silently change it.

A local backup database and copied files were checked for integrity. A cloud disaster
recovery rehearsal remains pending until a host exists.

## Production acceptance checklist — not yet executed

Record the actual URL, commit, provider/model, dates, and outcomes:

- Landing page/assets load over HTTPS; mobile menu/layout and desktop layout work.
- Dashboard and nested `/app/...` routes load after direct navigation and refresh.
- `/api/health` succeeds; unauthorized API access fails; cookies are Secure/HttpOnly.
- Register using the invitation, sign out/in, create a goal/course, and save settings.
- Upload a text-bearing PDF; verify pages, indexing status, and source passages.
- Create a second unrelated course; verify course and selected-document isolation.
- Add a real provider key through Settings and successfully test its connection.
- Generate/edit/save a curriculum and timetable; prepare and study a grounded lesson.
- Ask multi-turn Study AI questions; verify citations against the original PDF.
- Exercise chat actions for a task, quiz, schedule, curriculum, lesson and PDF.
- Take daily, weekly and revision quizzes; verify answers, scores, weak concepts,
  distinct mastery components, and saved attempt history.
- Add a searchable note; complete/edit a task and a learning block; refresh.
- Generate a revision-guide PDF; download PDF/Markdown and inspect their contents.
- Restart/redeploy the service; confirm all records, original uploads, generated
  downloads and FAISS retrieval remain usable. Reopen from a new browser session.
- Make an off-host backup and rehearse restoring it to an isolated service.
- Check logs for unhandled errors and ensure provider keys/private data are absent
  from frontend bundles, public URLs and logs.

Any failing check must be resolved before declaring deployment successful.
