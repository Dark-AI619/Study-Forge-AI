FROM node:24-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run lint && npm run build

FROM python:3.11-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    STUDYFORGE_DATA_DIR=/var/data/studyforge EMBEDDING_CACHE_DIR=/opt/studyforge-models \
    HF_HUB_DISABLE_TELEMETRY=1 TOKENIZERS_PARALLELISM=false
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./backend/requirements.txt
# CPU wheels avoid installing the much larger CUDA runtime on a CPU host.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r backend/requirements.txt
COPY backend/app ./backend/app
COPY backend/setup_model.py ./backend/setup_model.py
COPY backend/backup.py ./backend/backup.py
RUN python backend/setup_model.py
COPY --from=frontend /build/dist ./dist
# SQLite and the local FAISS write lock belong to one instance.
CMD ["sh", "-c", "exec uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
