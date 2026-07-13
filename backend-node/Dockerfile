# The backend owns detector subprocesses, so this image intentionally includes
# both Node.js and the CPU Python inference runtime to preserve that behavior.
FROM node:22-bookworm-slim

ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu

ENV NODE_ENV=production \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:${PATH}"

# FFmpeg and the small OpenCV runtime libraries are required for RTSP/video
# decoding. The CPU wheel index avoids pulling CUDA libraries into this image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libgl1 \
        libglib2.0-0 \
        python3 \
        python3-pip \
        python3-venv \
    && python3 -m venv "$VIRTUAL_ENV" \
    && "$VIRTUAL_ENV/bin/pip" install --no-cache-dir --index-url "$TORCH_INDEX_URL" torch torchvision \
    && rm -rf /var/lib/apt/lists/*

# Dependency manifests are copied before application code for stable caching.
COPY AI/requirements.txt /tmp/ai-requirements.txt
RUN pip install --no-cache-dir -r /tmp/ai-requirements.txt \
    && rm /tmp/ai-requirements.txt

WORKDIR /app/backend-node
COPY backend-node/package.json backend-node/package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

# Only runtime source is included; docs, frontend files, and dev scripts stay out.
COPY --chown=node:node backend-node/app.js ./app.js
COPY --chown=node:node backend-node/models ./models
COPY --chown=node:node AI/detect_humans_live-api.py /app/AI/detect_humans_live-api.py

# Ultralytics downloads weights on first use. Compose mounts /models as a named
# volume, while this ownership also supports running the image without Compose.
RUN mkdir -p /models \
    && chown -R node:node /app /models

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "app.js"]
