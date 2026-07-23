# Troubleshooting

## Backend exits on startup

Check required environment variables:

```env
JWT_SECRET=...
MONGO_URI=...
```

The backend exits if either value is missing.

## `/health` returns `503`

MongoDB is not connected. Check:

- `MONGO_URI`
- MongoDB container or service status
- network access to MongoDB Atlas if using a hosted database
- DNS issues; optionally set `MONGO_DNS_SERVERS`

## Frontend cannot reach backend

Check `frontend-vue/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For Docker production-style same-origin routing, root `.env` should usually leave:

```env
VITE_API_BASE_URL=
```

Rebuild the frontend container after changing this value because it is a Vite build-time variable.

## Login returns invalid token after restart or deploy

The JWT secret likely changed. Existing tokens become invalid when `JWT_SECRET` changes. Log in again or keep a stable production secret.

## Normal user cannot open admin pages

This is expected. Frontend admin pages require `localStorage.role === "admin"` and backend admin endpoints require JWT role `admin`.

## No admin account exists

The public `/register` route creates `user` accounts only. Promote or seed an admin account through a trusted database maintenance process.

## Livefeed stream unavailable

Check:

- `LIVEFEED_SOURCE_STREAM_URL`
- detector process logs
- camera RTSP URL and credentials
- camera network reachability from the backend or AI container
- `/api/livefeed/cameras` for backend-managed camera status

For backend-managed cameras, hardware must have:

- `type: "camera"`
- `status: "online"`
- `rtspUrl`

## Detector process starts and exits repeatedly

Likely causes:

- invalid RTSP URL
- camera unreachable
- missing Python dependencies
- invalid `DETECTOR_PYTHON_BIN`
- missing or incompatible YOLO model
- OpenCV/FFmpeg cannot decode the stream

Backend logs prefix detector output with `[DETECTOR:<deviceId>]`.

## YOLO model download is slow or fails

The first run can download model weights. In Docker, `model-cache` persists the model across rebuilds. In restricted networks, pre-populate the model file or point `DETECTOR_MODEL` to an available local model path.

## Settings responses omit reference images

This is intentional. The backend strips `livefeed.referenceImage` and `hardware.livefeed.referenceImage` from most settings responses to avoid large payloads. Use explicit include flags or hardware livefeed status endpoints when image metadata is needed.

## Hourly analytics is empty

Hourly analytics updates only after detection payloads arrive and MongoDB is connected. Verify:

- detector sends `detection:update` or `/api/livefeed/update`
- payload has a non-negative `peopleCount` or `count`
- MongoDB is connected
- `ANALYTICS_TIMEZONE` is set as expected

## Docker frontend is up but API calls fail

Check:

- `docker compose ps`
- backend health
- frontend Nginx proxy config
- `VITE_API_BASE_URL` build value
- browser network tab for failed paths
