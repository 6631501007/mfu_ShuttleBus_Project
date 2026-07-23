# Deployment Guide

The repository includes a Docker Compose stack in `compose.yaml`.

## Services

| Service | Purpose |
| --- | --- |
| `frontend` | Builds and serves the Vue application through Nginx. Publishes `${FRONTEND_PORT:-8080}:8080`. |
| `backend` | Runs Express API, Socket.IO, MongoDB access, and backend-managed AI detector processes. |
| `mongo` | MongoDB 8.0 with persistent `mongo-data` volume. Internal-only network. |
| `ai` | Optional standalone detector service enabled with the `standalone-ai` profile. |

## Networks

- `edge` - frontend/backend/optional AI communication.
- `data` - internal network for backend-to-MongoDB communication.

MongoDB is not published to the host by default.

## Volumes

- `mongo-data` - MongoDB persistent database files.
- `model-cache` - YOLO model cache reused across image/container rebuilds.

## Basic Deployment

```bash
cp .env.example .env
docker compose up --build -d
```

Required production values:

```env
JWT_SECRET=<long-random-secret>
FRONTEND_PORT=8080
MONGO_URI=mongodb://mongo:27017/demo
ANALYTICS_TIMEZONE=Asia/Bangkok
DETECTOR_MODEL=yolov8s
```

For same-origin API requests through the frontend Nginx proxy, leave:

```env
VITE_API_BASE_URL=
```

## Optional Standalone AI Profile

```bash
docker compose --profile standalone-ai up --build -d
```

Set:

```env
AI_SOURCE=rtsp://username:password@camera-host/path
```

The backend image already includes AI support for backend-managed cameras. Use the standalone AI profile only when a separate detector container is desired.

## Health and Logs

Backend health through the published frontend/Nginx port:

```bash
curl http://localhost:8080/health
```

If running the backend directly outside Docker, use `http://localhost:3000/health`.

Container status:

```bash
docker compose ps
```

Logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

## Backup and Restore

Backup MongoDB from the Compose network:

```bash
docker compose exec mongo mongodump --archive=/tmp/backup.archive
docker compose cp mongo:/tmp/backup.archive ./backup.archive
```

Restore:

```bash
docker compose cp ./backup.archive mongo:/tmp/backup.archive
docker compose exec mongo mongorestore --archive=/tmp/backup.archive --drop
```

Validate backup and restore commands in a staging environment before using them for production data.

## Rollback

Recommended rollback steps:

1. Keep the previous image tag or previous Git revision available.
2. Stop the current stack.
3. Restore the previous application version.
4. Restore MongoDB only if a data migration or destructive data change was deployed.
5. Run smoke checks for `/health`, login, dashboard, settings, stations, and livefeed.

## Security Notes

- Do not expose MongoDB directly.
- Use a strong `JWT_SECRET`.
- Treat camera RTSP URLs as secrets.
- Put TLS, domain routing, rate limiting, and network restrictions in front of the stack for production use.
- Livefeed ingest endpoints are unauthenticated in the current code and should be protected by network policy if internet exposure is possible.
