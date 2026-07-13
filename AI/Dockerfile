# Standalone CPU detector image. The backend image contains the same runtime for
# dynamically managed cameras; use this image when AI is deployed independently.
FROM python:3.12-slim-bookworm

ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libgl1 libglib2.0-0 \
    && pip install --no-cache-dir --index-url "$TORCH_INDEX_URL" torch torchvision \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY detect_humans_live-api.py ./

# A fixed non-root UID makes bind-mounted model ownership predictable on Linux.
RUN useradd --create-home --uid 10001 detector \
    && mkdir -p /models \
    && chown -R detector:detector /app /models

USER detector
EXPOSE 8090

# FastAPI exposes /docs once the MJPEG server thread has started.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8090/docs', timeout=3)" || exit 1

ENTRYPOINT ["python", "detect_humans_live-api.py"]
# A camera source is deployment-specific; pass --source explicitly when running.
CMD ["--help"]
