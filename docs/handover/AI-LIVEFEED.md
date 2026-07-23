# AI Livefeed

The AI livefeed feature combines a Python YOLOv8 detector, backend ingest/proxy endpoints, Socket.IO updates, MongoDB analytics, and Vue livefeed UI.

## Components

- `AI/detect_humans_live-api.py` - Python detector service.
- `backend-node/app.js` - starts/stops backend-managed detector processes, receives detection events, proxies MJPEG streams, updates analytics.
- `frontend-vue/src/views/Livefeed.vue` - livefeed UI.
- `Setting.hardware[]` - camera configuration source.
- `HourlyAnalytics` - persisted hourly queue metrics.

## Runtime Flow

```text
RTSP / webcam source
  -> Python YOLOv8 detector
  -> Socket.IO detection:update or HTTP /api/livefeed/update
  -> Express backend
  -> in-memory live detection state
  -> MongoDB hourly_analytics
  -> Socket.IO detection:broadcast
  -> Vue livefeed / analytics screens
```

## Backend-Managed Cameras

When settings include hardware with:

- `type: "camera"`
- `status: "online"`
- `rtspUrl` set

the backend starts `AI/detect_humans_live-api.py` as a child process. Each camera gets an MJPEG port based on `DETECTOR_BASE_PORT + index + 1`.

Detector arguments include:

- `--source <rtspUrl>`
- `--camera-id <deviceId>`
- `--mjpeg-port <allocated-port>`
- `--model <DETECTOR_MODEL>`
- `--socketio-url http://localhost:<PORT>`
- `--config-url http://localhost:<PORT>/api/livefeed/config?cameraId=<deviceId>`
- `--no-stop-notify`

The backend restarts crashed detector processes with exponential backoff.

## Standalone AI Service

The detector can also run manually:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py \
  --source "rtsp://user:pass@camera-host/path" \
  --camera-id cam01 \
  --mjpeg-port 8090 \
  --socketio-url http://localhost:3000
```

HTTP fallback can be enabled with:

```bash
--api-url http://localhost:3000/api/livefeed/update
```

## Detector Options

Important options from the script:

- `--source`
- `--camera-id`
- `--conf`
- `--iou`
- `--model`
- `--imgsz`
- `--device`
- `--skip-frames`
- `--drop-frames`
- `--socketio-url`
- `--socketio-event`
- `--emit-interval`
- `--mjpeg-port`
- `--stream-fps`
- `--jpeg-quality`
- `--stream-width`
- `--api-url`
- `--api-interval`
- `--config-url`
- `--config-refresh-interval`
- `--reconnect-delay`
- `--max-read-failures`
- `--ffmpeg-capture-options`
- `--no-stop-notify`

## Livefeed Config

`GET /api/livefeed/config?cameraId=<id>` returns:

- `dwellSeconds`
- `referenceImage`
- `zones[]`

Zones use percentage coordinates. The backend currently keeps one active counting zone during normalization.

## Stream URLs

- `/api/livefeed/stream` proxies `LIVEFEED_SOURCE_STREAM_URL`.
- `/api/livefeed/stream/:cameraId` proxies a backend-managed detector's MJPEG stream.

## Analytics Behavior

When detection payloads arrive, the backend:

1. Normalizes count, active count, frame size, detections, and zones.
2. Stores the latest state in memory.
3. Emits `detection:broadcast`.
4. Updates `hourly_analytics` if MongoDB is connected.

Hourly buckets use `ANALYTICS_TIMEZONE`, defaulting to `Asia/Bangkok`.

## Production Notes

- Keep RTSP credentials in environment variables or secured settings storage.
- Restrict livefeed ingest endpoints at the network layer if exposed outside a trusted network.
- Monitor detector child process logs prefixed with `[DETECTOR:<deviceId>]`.
- Persist model cache in Docker using the `model-cache` volume.
