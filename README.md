# BusStop / APC-QA Demo

A developer-focused bus stop passenger monitoring system with a Vue frontend, Node.js/Express API, MongoDB data store, and Python YOLOv8 live camera detection service.

The system supports login, role-based pages, station management, dashboard analytics, map views, feedback handling, settings, hardware/camera configuration, livefeed monitoring, and hourly queue analytics generated from AI detections.

## Architecture at a Glance

```text
Browser
  -> Vue/Vite frontend
  -> Express API + Socket.IO backend
  -> MongoDB

Camera / RTSP / Webcam
  -> Python YOLOv8 detector
  -> Socket.IO detection:update or HTTP /api/livefeed/update
  -> Express backend
  -> MongoDB hourly_analytics
  -> Vue livefeed and analytics pages
```

## Repository Structure

```text
.
|-- AI/              # Python YOLOv8 live camera detector
|-- backend-node/    # Express API, Socket.IO, Mongoose models
|-- frontend-vue/    # Vue 3 / Vite frontend
|-- docs/            # Handover docs, architecture, process records
|-- compose.yaml     # Docker Compose stack
`-- README.md
```

## Quick Start

Backend:

```bash
cd backend-node
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend-vue
npm install
cp .env.example .env
npm run dev
```

AI service:

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python detect_humans_live-api.py --source 0 --socketio-url http://localhost:3000
```

Docker:

```bash
cp .env.example .env
docker compose up --build
```

## Required Configuration

The backend requires:

```env
JWT_SECRET=change-me-to-a-long-random-secret
MONGO_URI=mongodb://127.0.0.1:27017/demo
```

The frontend usually uses:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Do not commit real secrets, MongoDB credentials, or camera RTSP credentials.

## Documentation

Start with [docs/README.md](docs/README.md).

Current handover documentation:

- [Architecture](docs/ARCHITECTURE.md)
- [Setup](docs/handover/SETUP.md)
- [Environment Variables](docs/handover/ENVIRONMENT.md)
- [API Reference](docs/handover/API.md)
- [Database Model](docs/handover/DATABASE.md)
- [Authentication and Authorization](docs/handover/AUTHORIZATION.md)
- [AI Livefeed](docs/handover/AI-LIVEFEED.md)
- [Deployment](docs/handover/DEPLOYMENT.md)
- [Testing and QA](docs/handover/TESTING.md)
- [Troubleshooting](docs/handover/TROUBLESHOOTING.md)
- [Handover Checklist](docs/handover/HANDOVER-CHECKLIST.md)

The repository also contains AI workflow, task progress, templates, and change records under `docs/`. Some of those files are historical or process-oriented, so verify them against source code before treating them as current runtime behavior.

## Source of Truth

Source code is the authority for current behavior. If a document conflicts with the implementation, update the document after confirming the code path.
