# Environment Variables

This document lists environment variables used by the current system.

## Root `.env`

Used by `compose.yaml` for Docker Compose interpolation.

| Variable | Required | Default / Example | Purpose |
| --- | --- | --- | --- |
| `JWT_SECRET` | Yes | `replace-with-a-long-random-secret` | Secret used by the backend to sign and verify JWTs. |
| `FRONTEND_PORT` | No | `8080` | Host port for the frontend container. |
| `MONGO_URI` | No | `mongodb://mongo:27017/demo` | MongoDB connection string for the backend container. |
| `ANALYTICS_TIMEZONE` | No | `Asia/Bangkok` | Timezone used when bucketing hourly analytics. |
| `DETECTOR_MODEL` | No | `yolov8s` | YOLO model name or model path used by detector processes. |
| `AI_SOURCE` | Only standalone AI profile | `rtsp://...` | Camera source for the optional standalone AI container. |
| `VITE_API_BASE_URL` | No | empty | Build-time frontend API base URL. Empty means same-origin through Nginx in production. |

## Backend `backend-node/.env`

| Variable | Required | Default / Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Backend HTTP and Socket.IO port. |
| `JWT_SECRET` | Yes | `change-me-to-a-long-random-secret` | JWT signing secret. Must be strong and private. |
| `MONGO_URI` | Yes | `mongodb://127.0.0.1:27017/demo` | MongoDB connection URI. |
| `MONGO_DNS_SERVERS` | No | `8.8.8.8,8.8.4.4` | Optional DNS servers used before connecting to MongoDB. |
| `MONGO_SERVER_SELECTION_TIMEOUT_MS` | No | `5000` | Mongoose server selection timeout. |
| `MONGO_SOCKET_TIMEOUT_MS` | No | `45000` | Mongoose socket timeout. |
| `LIVEFEED_SOURCE_STREAM_URL` | No | `http://localhost:8090/stream` | Source MJPEG stream proxied by `/api/livefeed/stream`. |
| `LIVEFEED_STREAM_URL` | No | legacy fallback | Older name accepted as fallback for `LIVEFEED_SOURCE_STREAM_URL`. |
| `LIVEFEED_PUBLIC_STREAM_URL` | No | `/api/livefeed/stream` | URL exposed in livefeed detection status. |
| `DETECTOR_PYTHON_BIN` | No | auto-detected | Python executable for backend-managed detector processes. |
| `PYTHON_CMD` | No | fallback | Legacy fallback for detector Python executable. |
| `DETECTOR_SCRIPT_PATH` | No | `../AI/detect_humans_live-api.py` | Detector script path, resolved from `backend-node`. |
| `DETECTOR_BASE_PORT` | No | `8090` | Base port used to allocate per-camera MJPEG streams. |
| `DETECTOR_MODEL` | No | `yolov8s` | YOLO model name/path passed to detector processes. |
| `DETECTOR_IMGSZ` | No | `640` | YOLO image size. |
| `DETECTOR_SKIP_FRAMES` | No | `2` | Number of frames skipped between inference passes. |
| `DETECTOR_STREAM_FPS` | No | `6` | MJPEG output frame rate. |
| `DETECTOR_STREAM_WIDTH` | No | `640` | MJPEG output width. |
| `DETECTOR_JPEG_QUALITY` | No | `65` | MJPEG JPEG quality. |
| `DETECTOR_SOCKET_EMIT_INTERVAL` | No | `0.5` | Socket.IO emit interval in seconds. |
| `DETECTOR_RESTART_BASE_MS` | No | `2000` | Initial backend-managed detector restart delay. |
| `DETECTOR_RESTART_MAX_MS` | No | `30000` | Maximum detector restart delay. |
| `DETECTOR_RESTART_RESET_MS` | No | `60000` | Time after which detector restart attempts reset. |
| `ANALYTICS_TIMEZONE` | No | `Asia/Bangkok` | Timezone for hourly analytics buckets. |

## Frontend `frontend-vue/.env`

| Variable | Required | Default / Example | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:3000` in dev, same-origin in production | Base URL for REST API calls. |

## Secret Handling

Do not commit real `.env` files. Keep camera credentials, MongoDB credentials, and JWT secrets outside Git. Use the included `.env.example` files only as templates.
