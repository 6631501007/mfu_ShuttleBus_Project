# Setup Guide

This guide describes how to run the current BusStop / APC-QA demo system for local development.

## Prerequisites

- Git
- Node.js and npm
- Python 3 with `venv`
- MongoDB, either local or hosted
- Docker Engine / Docker Desktop with Docker Compose v2, if using the containerized stack
- FFmpeg support for OpenCV is recommended for RTSP camera sources

## Repository Layout

```text
.
|-- AI/              # Python YOLOv8 live camera detector
|-- backend-node/    # Node.js / Express API, Socket.IO, Mongoose models
|-- frontend-vue/    # Vue 3 / Vite frontend
|-- docs/            # Documentation, handover notes, process records
|-- compose.yaml     # Containerized stack
`-- README.md        # Project entry point
```

## Backend Setup

```bash
cd backend-node
npm install
cp .env.example .env
npm run dev
```

Required backend values in `backend-node/.env`:

```env
PORT=3000
JWT_SECRET=change-me-to-a-long-random-secret
MONGO_URI=mongodb://127.0.0.1:27017/demo
```

The backend exits on startup if `JWT_SECRET` or `MONGO_URI` is missing.

## Frontend Setup

```bash
cd frontend-vue
npm install
cp .env.example .env
npm run dev
```

For local development, set:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## AI Service Setup

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python detect_humans_live-api.py --source 0 --socketio-url http://localhost:3000
```

Use an RTSP URL instead of `0` when connecting a real camera:

```bash
python detect_humans_live-api.py --source "rtsp://user:pass@camera-host/path" --socketio-url http://localhost:3000
```

## Docker Setup

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Only the frontend is published by default. MongoDB is kept on an internal Docker network. The optional standalone AI container can be enabled with:

```bash
docker compose --profile standalone-ai up --build
```

## Smoke Check

After startup:

1. Open the frontend at the configured frontend port, usually `http://localhost:8080` for Docker or the Vite URL for local dev.
2. Check backend health: `GET http://localhost:3000/health`.
3. Register or log in.
4. Verify admin-only pages with an admin user.
5. If testing AI, confirm `/api/livefeed/detection` and the livefeed page update after detector messages arrive.
