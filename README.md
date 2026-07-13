# BusStop / APC-QA Demo

A developer-focused web application for bus stop passenger monitoring, station management, feedback handling, analytics, and live camera-based human detection.

The repository contains a Vue frontend, a Node.js/Express API, MongoDB/Mongoose data models, and a Python YOLOv8 AI service that can process webcam or RTSP camera streams.

> **Note:** Some files under `docs/` describe a historical or separate "NewSystem" workflow. This README is based on the source code that exists in this repository.

## Main Features

- User registration and login with JWT authentication.
- Role-based navigation for `admin` and `user` roles.
- Admin dashboard for passenger, station, bus, notification, and queue analytics data.
- Station map views using Leaflet.
- Feedback submission and admin feedback resolution.
- Settings screens for stations, notification settings, hardware devices, and live feed counting zones.
- Live feed camera monitoring with AI detection metadata.
- Hourly queue analytics persisted from live detection updates.

## Technologies Used

| Area | Technology |
| --- | --- |
| Frontend | Vue 3, Vite, Vue Router, Leaflet, ApexCharts, Chart.js, Tailwind/PostCSS |
| Backend | Node.js, Express 5, Socket.IO, Mongoose, bcryptjs, JSON Web Token |
| AI service | Python, OpenCV, Ultralytics YOLOv8, FastAPI, Uvicorn, NumPy, Requests, python-socketio |
| Database | MongoDB |
| Auth | JWT bearer tokens, bcrypt password hashing |

## Project Architecture Overview

```text
Browser
  -> Vue/Vite frontend
  -> Express API + Socket.IO backend
  -> MongoDB

Camera / RTSP / Webcam
  -> Python YOLOv8 AI service
  -> Socket.IO detection:update or HTTP /api/livefeed/update
  -> Express backend
  -> MongoDB hourly_analytics
  -> Vue live feed and analytics pages
```

# Repository Structure

```text
.
├── AI/
├── backend-node/
├── docs/
├── frontend-vue/
├── README.md
└── .gitignore
```

| Path | Purpose |
| --- | --- |
| `AI/` | Python live camera human detection service. Contains `detect_humans_live-api.py` and `requirements.txt`. |
| `AI/output/` | Generated output directory. **TODO:** Verify intended usage. |
| `backend-node/` | Express API server, Socket.IO server, MongoDB connection, auth logic, detector process management, and Mongoose models. |
| `backend-node/models/` | Mongoose schemas for users, stations, buses, feedback, settings, analytics, and hourly analytics. |
| `frontend-vue/` | Vue 3 + Vite application. |
| `frontend-vue/src/views/` | Main UI pages: login, dashboard, home, map, live feed, settings, analytics, and feedback. |
| `frontend-vue/src/service/` | Frontend API wrapper. |
| `frontend-vue/src/lib/` | Frontend utility modules such as station alert helpers. |
| `frontend-vue/src/router/` | Vue Router route definitions and client-side auth guards. |
| `frontend-vue/src/components/` | Shared Vue component(s), currently top-bar notification UI. |
| `frontend-vue/public/` | Static frontend assets. |
| `docs/` | Project notes, AI workflow documents, PRD/change templates, and agent guidance. Some docs reference source paths not present in this repo. |

# Prerequisites

- Git.
- Node.js. The local environment used for inspection was Node.js `v22.22.2`; exact minimum is not declared in the repo. **TODO:** Verify this information.
- npm. The local environment used for inspection was npm `10.9.7`; exact minimum is not declared in the repo. **TODO:** Verify this information.
- Python 3. The local environment used for inspection was Python `3.12.3`; exact minimum is not declared in the repo. **TODO:** Verify this information.
- MongoDB, either local MongoDB or MongoDB Atlas.
- FFmpeg is recommended for RTSP camera handling through OpenCV.
- Docker Desktop / Docker Engine: not required by the current repository because no Docker files are present.
- Docker Compose: not required by the current repository because no Compose files are present.
- CUDA / NVIDIA Driver: optional only if running YOLO inference on CUDA. The default AI command uses CPU.

# Quick Setup Guide

## 🇺🇸 English

### 1. Clone Repository

```bash
git clone <repository-url>
cd demo
```

### 2. Install Dependencies

Install backend, frontend, and AI dependencies separately.

```bash
cd backend-node
npm install
```

```bash
cd ../frontend-vue
npm install
```

```bash
cd ../AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

On Windows PowerShell, activate the AI virtual environment with:

```powershell
cd AI
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create backend and frontend `.env` files from the examples.

```bash
cp backend-node/.env.example backend-node/.env
cp frontend-vue/.env.example frontend-vue/.env
```

On Windows PowerShell:

```powershell
copy backend-node\.env.example backend-node\.env
copy frontend-vue\.env.example frontend-vue\.env
```

Edit `backend-node/.env` and set at least:

```env
PORT=3000
JWT_SECRET=change-me-to-a-long-random-secret
MONGO_URI=mongodb://127.0.0.1:27017/demo
LIVEFEED_SOURCE_STREAM_URL=http://localhost:8090/stream
LIVEFEED_PUBLIC_STREAM_URL=/api/livefeed/stream
```

Edit `frontend-vue/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> **Warning:** Do not commit real secrets or production MongoDB credentials.

### 4. Install Backend Dependencies

```bash
cd backend-node
npm install
```

### 5. Install Frontend Dependencies

```bash
cd frontend-vue
npm install
```

### 6. Install AI Dependencies

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 7. Prepare Database

Start MongoDB locally or configure `MONGO_URI` for MongoDB Atlas.

Local MongoDB example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/demo
```

There are no migration or seed scripts in the repository. Data is created through the API and frontend forms.

### 8. Run Backend

```bash
cd backend-node
npm run dev
```

The backend defaults to:

```text
http://localhost:3000
```

### 9. Run Frontend

```bash
cd frontend-vue
npm run dev
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

If Vite prints a different URL, use the URL shown in the terminal.

### 10. Run AI Service

Webcam example:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source 0
```

RTSP camera example:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source "rtsp://username:password@camera-ip/path"
```

The AI service exposes an MJPEG preview at:

```text
http://localhost:8090/stream
```

### 11. Access the Application

Open the frontend in a browser:

```text
http://localhost:5173
```

The frontend calls the backend configured by `VITE_API_BASE_URL`.

### 12. Login Information

The app provides registration through the login page and `/register` endpoint. New users are created with the `user` role.

Most admin pages require the `admin` role. No default admin seed account exists in the repository.

For local development, register a user and update the role in MongoDB:

```javascript
db.users.updateOne(
  { username: "<your-username>" },
  { $set: { role: "admin" } }
)
```

### 13. Default Ports

| Service | Default Port | Source |
| --- | ---: | --- |
| Backend API / Socket.IO | `3000` | `backend-node/.env.example`, `backend-node/app.js` |
| Frontend dev server | `5173` | Vite default |
| AI MJPEG stream | `8090` | `AI/detect_humans_live-api.py` |
| Auto-started per-camera detectors | `DETECTOR_BASE_PORT + index + 1` | `backend-node/app.js` |

### 14. Troubleshooting

- Backend exits immediately: verify `JWT_SECRET` and `MONGO_URI` exist in `backend-node/.env`.
- Frontend receives HTML instead of JSON: verify `VITE_API_BASE_URL` points to the backend, not the frontend dev server.
- Login succeeds but admin pages redirect to `/home`: the account role is not `admin`.
- Live feed is offline: start the AI service or configure an online camera hardware entry with a valid RTSP URL.
- YOLO model download fails: verify network access, because Ultralytics downloads `yolov8*.pt` weights when missing.

## 🇹🇭 ภาษาไทย

### 1. Clone Repository

```bash
git clone <repository-url>
cd demo
```

### 2. ติดตั้ง Dependencies

โปรเจกต์นี้แยก dependencies เป็น 3 ส่วน: backend, frontend และ AI service

```bash
cd backend-node
npm install
```

```bash
cd ../frontend-vue
npm install
```

```bash
cd ../AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

ถ้าใช้ Windows PowerShell:

```powershell
cd AI
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จากไฟล์ตัวอย่าง

```bash
cp backend-node/.env.example backend-node/.env
cp frontend-vue/.env.example frontend-vue/.env
```

ถ้าใช้ Windows PowerShell:

```powershell
copy backend-node\.env.example backend-node\.env
copy frontend-vue\.env.example frontend-vue\.env
```

แก้ไข `backend-node/.env` อย่างน้อยให้มีค่าต่อไปนี้:

```env
PORT=3000
JWT_SECRET=change-me-to-a-long-random-secret
MONGO_URI=mongodb://127.0.0.1:27017/demo
LIVEFEED_SOURCE_STREAM_URL=http://localhost:8090/stream
LIVEFEED_PUBLIC_STREAM_URL=/api/livefeed/stream
```

แก้ไข `frontend-vue/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> **Warning:** ห้าม commit secret จริงหรือ connection string ของ production ลง repository

### 4. ติดตั้ง Backend Dependencies

```bash
cd backend-node
npm install
```

### 5. ติดตั้ง Frontend Dependencies

```bash
cd frontend-vue
npm install
```

### 6. ติดตั้ง AI Dependencies

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 7. เตรียม Database

ให้เปิดใช้งาน MongoDB ในเครื่อง หรือใส่ connection string ของ MongoDB Atlas ใน `MONGO_URI`

ตัวอย่าง MongoDB ในเครื่อง:

```env
MONGO_URI=mongodb://127.0.0.1:27017/demo
```

repository นี้ไม่มี migration script หรือ seed script ข้อมูลจะถูกสร้างผ่าน API และหน้าจอ frontend

### 8. รัน Backend

```bash
cd backend-node
npm run dev
```

backend จะรันที่:

```text
http://localhost:3000
```

### 9. รัน Frontend

```bash
cd frontend-vue
npm run dev
```

โดยปกติ Vite จะรันที่:

```text
http://localhost:5173
```

ถ้า terminal แสดง URL อื่น ให้ใช้ URL นั้นแทน

### 10. รัน AI Service

ตัวอย่างใช้ webcam:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source 0
```

ตัวอย่างใช้กล้อง RTSP:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source "rtsp://username:password@camera-ip/path"
```

AI service จะเปิด MJPEG preview ที่:

```text
http://localhost:8090/stream
```

### 11. เข้าใช้งาน Application

เปิด frontend ใน browser:

```text
http://localhost:5173
```

frontend จะเรียก backend ตามค่าที่ตั้งไว้ใน `VITE_API_BASE_URL`

### 12. ข้อมูล Login

ระบบสมัครสมาชิกได้จากหน้า login และ endpoint `/register` ผู้ใช้ใหม่จะมี role เป็น `user`

หน้าสำหรับ admin ส่วนใหญ่ต้องใช้ role `admin` และ repository นี้ไม่มี default admin account หรือ seed script

สำหรับ local development ให้สมัครผู้ใช้ก่อน แล้วแก้ role ใน MongoDB:

```javascript
db.users.updateOne(
  { username: "<your-username>" },
  { $set: { role: "admin" } }
)
```

### 13. Default Ports

| Service | Default Port | Source |
| --- | ---: | --- |
| Backend API / Socket.IO | `3000` | `backend-node/.env.example`, `backend-node/app.js` |
| Frontend dev server | `5173` | Vite default |
| AI MJPEG stream | `8090` | `AI/detect_humans_live-api.py` |
| detector รายกล้องที่ backend สั่งเปิด | `DETECTOR_BASE_PORT + index + 1` | `backend-node/app.js` |

### 14. Troubleshooting

- backend ปิดทันทีตอนเริ่มรัน: ตรวจว่า `backend-node/.env` มี `JWT_SECRET` และ `MONGO_URI`
- frontend ได้ HTML แทน JSON: ตรวจว่า `VITE_API_BASE_URL` ชี้ไป backend ไม่ใช่ Vite dev server
- login ได้แต่เข้า admin page แล้วถูกส่งไป `/home`: user ยังไม่ใช่ role `admin`
- live feed offline: ต้องเปิด AI service หรือเพิ่ม hardware กล้องที่ online และมี RTSP URL ถูกต้อง
- YOLO model โหลดไม่ได้: ตรวจ network เพราะ Ultralytics จะดาวน์โหลดไฟล์ `yolov8*.pt` เมื่อยังไม่มีในเครื่อง

# Environment Variables

| Variable | Description | Required | Default |
| --- | --- | --- | --- |
| `PORT` | Backend HTTP and Socket.IO port. | No | `3000` |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens. Backend exits if missing. | Yes | None |
| `MONGO_URI` | MongoDB connection string. Backend exits if missing. | Yes | None |
| `MONGO_DNS_SERVERS` | Optional comma-separated DNS servers passed to Node `dns.setServers()` before MongoDB connection. | No | Empty |
| `MONGO_SERVER_SELECTION_TIMEOUT_MS` | Mongoose server selection timeout. | No | `5000` |
| `MONGO_SOCKET_TIMEOUT_MS` | Mongoose socket timeout. | No | `45000` |
| `LIVEFEED_SOURCE_STREAM_URL` | Source MJPEG stream proxied by `/api/livefeed/stream`. | No | `http://localhost:8090/stream` |
| `LIVEFEED_STREAM_URL` | Legacy fallback for `LIVEFEED_SOURCE_STREAM_URL`. | No | None |
| `LIVEFEED_PUBLIC_STREAM_URL` | Stream URL returned in live feed detection status. | No | `/api/livefeed/stream` |
| `DETECTOR_PYTHON_BIN` | Python executable used by backend when spawning detector processes. | No | `../AI/.venv/bin/python`, `../.venv/bin/python`, or `python3` |
| `DETECTOR_SCRIPT_PATH` | Detector script path used by backend. | No | `../AI/detect_humans_live-api.py` |
| `DETECTOR_BASE_PORT` | Base port used for auto-started per-camera detector MJPEG streams. | No | `8090` |
| `DETECTOR_MODEL` | YOLOv8 model variant passed to the AI script by backend. | No | `yolov8s` |
| `DETECTOR_IMGSZ` | YOLO inference image size passed by backend. | No | `640` |
| `DETECTOR_SKIP_FRAMES` | Process every Nth frame when backend starts AI detectors. | No | `2` |
| `DETECTOR_STREAM_FPS` | MJPEG preview FPS for backend-started detector processes. | No | `6` |
| `DETECTOR_STREAM_WIDTH` | MJPEG preview width for backend-started detector processes. | No | `640` |
| `DETECTOR_JPEG_QUALITY` | MJPEG JPEG quality for backend-started detector processes. | No | `65` |
| `DETECTOR_SOCKET_EMIT_INTERVAL` | Minimum seconds between AI Socket.IO emits for backend-started detectors. | No | `0.5` |
| `ANALYTICS_TIMEZONE` | Time zone used for hourly analytics buckets and labels. | No | `Asia/Bangkok` |
| `VITE_API_BASE_URL` | Frontend API base URL. Development defaults to `http://localhost:3000`; production defaults to same-origin proxying. | No | Environment-dependent |

> **Note:** The AI script is configured through CLI flags, not `.env` variables.

# Running with Docker

The default Compose stack runs the Vue production build, Express backend,
backend-managed CPU detector runtime, and MongoDB. Only the frontend is
published; Nginx proxies API and Socket.IO traffic to the private backend.

```bash
cp .env.example .env
# Replace JWT_SECRET in .env before starting.
docker compose up --build -d
docker compose ps
docker compose logs -f backend
```

Open `http://localhost:8080`. Stop the stack without deleting MongoDB data or
downloaded YOLO weights:

```bash
docker compose down
```

The backend starts one detector subprocess for each online RTSP camera saved in
hardware settings. For a separately managed detector instead, set `AI_SOURCE`
to a container-reachable RTSP URL and enable the optional profile:

```bash
docker compose --profile standalone-ai up --build -d
```

The detector defaults to CPU because the repository declares no CUDA version or
GPU requirement. A CUDA deployment should use an NVIDIA-compatible PyTorch base,
declare a matching host driver/runtime, and set the detector device explicitly.

# API Overview

All `/api/*` routes are protected by JWT authentication and database availability middleware except the live feed ingest/config/stream endpoints declared before `app.use('/api', authMiddleware)`.

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `GET` | `/health` | Backend and MongoDB health status. | Public |
| `POST` | `/register` | Register a new user with role `user`. | Public |
| `POST` | `/login` | Login and receive JWT token. | Public |
| `POST` | `/api/livefeed/update` | Receive AI detection count and metadata; updates hourly analytics when MongoDB is connected. | Public |
| `POST` | `/api/livefeed/stop` | Clear live feed detection state. | Public |
| `GET` | `/api/livefeed/stream` | Proxy the configured MJPEG stream. | Public |
| `GET` | `/api/livefeed/stream/:cameraId` | Proxy a running per-camera detector MJPEG stream. | Public |
| `GET` | `/api/livefeed/config` | Return live feed zone/dwell configuration, optionally by `cameraId`. | Public, requires database |
| `GET` | `/api/dashboard` | Dashboard KPIs, charts, notifications, stations, buses, hourly analytics. | Admin |
| `GET` | `/api/analytics` | Latest analytics overview and chart datasets. | Admin |
| `GET` | `/api/hourly-analytics` | Hourly analytics, optionally filtered by `station_id`; supports `limit`. | Admin |
| `POST` | `/api/analytics` | Create analytics document. | Admin |
| `GET` | `/api/home` | User home data: passenger chart, stations, rankings. | Authenticated |
| `GET` | `/api/map` | Admin station map data. | Admin |
| `GET` | `/api/livefeed/detection` | Current live feed detection status. | Admin |
| `GET` | `/api/livefeed/cameras` | Configured camera hardware and detector status. | Admin |
| `GET` | `/api/feedback` | Feedback list and resolved/unresolved summary. | Admin |
| `POST` | `/api/feedback` | Submit feedback for current user. | Authenticated |
| `PATCH` | `/api/feedback/:id` | Update feedback status or response. | Admin |
| `GET` | `/api/settings` | Read settings; supports `includeReferenceImages=true`. | Admin |
| `PUT` | `/api/settings` | Save settings and synchronize detector processes. | Admin |
| `POST` | `/api/settings/zones` | Add settings zone. | Admin |
| `PUT` | `/api/settings/zones/:index` | Update settings zone by array index. | Admin |
| `DELETE` | `/api/settings/zones/:index` | Delete settings zone by array index. | Admin |
| `GET` | `/api/settings/hardware` | List hardware devices. | Admin |
| `POST` | `/api/settings/hardware` | Add hardware device. | Admin |
| `PUT` | `/api/settings/hardware/:hardwareId` | Update hardware device. | Admin |
| `GET` | `/api/settings/hardware/:hardwareId/livefeed/status` | Read hardware livefeed config and reference image byte size. | Admin |
| `PUT` | `/api/settings/hardware/:hardwareId/livefeed` | Save livefeed dwell/zones for camera hardware. | Admin |
| `DELETE` | `/api/settings/hardware/:hardwareId` | Delete hardware device. | Admin |
| `POST` | `/api/stations` | Create station. | Admin |
| `GET` | `/api/stations` | List stations. | Admin |
| `PUT` | `/api/stations-bulk` | Replace all stations in bulk. | Admin |
| `PUT` | `/api/stations/bulk` | Replace all stations in bulk. | Admin |
| `PUT` | `/api/stations/:id` | Update station by MongoDB document ID. | Admin |
| `DELETE` | `/api/stations/:id` | Delete station by MongoDB document ID. | Admin |
| `POST` | `/api/buses` | Create bus. | Admin |
| `GET` | `/api/user-map` | Station map data for non-admin users. | Authenticated |
| `GET` | `/api/user/me` | Current user profile. | Authenticated |

## Socket.IO Events

| Event | Direction | Description |
| --- | --- | --- |
| `detection:update` | AI/client -> backend | Sends detection metadata to backend. |
| `detection:broadcast` | backend -> clients | Broadcasts current detection status after a valid update. |
| `detection:error` | backend -> client | Sent when detection payload is invalid. |

# Database

## Database Type

MongoDB through Mongoose.

## Collections / Models

| Model | Collection | Main Fields |
| --- | --- | --- |
| `User` | `users` | `username`, hashed `password`, `role` (`user` or `admin`) |
| `Station` | `stations` | `stationId`, `name`, `desc`, `zone`, `location`, `capacity`, `waitingPassengers`, `incomingBuses`, `status` |
| `Bus` | `buses` | `busId`, `route`, `status`, `currentLocation`, `eta` |
| `Feedback` | `feedbacks` | `userName`, `message`, `rating`, `status`, `response` |
| `Analytics` | `analytics` | date ranges, terminals, metrics, weekly/monthly/previous chart data |
| `HourlyAnalytics` | `hourly_analytics` | station/camera ID, hourly queue counts, queue time metrics, total persons processed |
| `Setting` | `settings` | zones, notification channels, delay threshold, hardware, livefeed configuration |

## Relationships

- No Mongoose `ref` relationships are defined.
- `HourlyAnalytics.station_id` is derived from camera settings when possible.
- Feedback stores `userName` as text rather than a user reference.

## Indexes

- `HourlyAnalytics` has a unique index on `{ station_id: 1, timestamp: 1 }`.
- `HourlyAnalytics` has an index on `{ timestamp: -1 }`.
- `Station.stationId` is unique.
- `Bus.busId` is unique.

## Migrations

No migration framework or migration files were found.

## Seed Data

No seed script was found. **TODO:** Verify this information.

# AI Service

The AI service is implemented in `AI/detect_humans_live-api.py`.

## Model Used

- Ultralytics YOLOv8.
- CLI default: `yolov8n`.
- Backend-spawned detector default: `yolov8s`.
- The script loads model weights with `YOLO(f"{args.model}.pt")`.

## Input

- Webcam index, for example `--source 0`.
- RTSP URL, for example `--source "rtsp://username:password@camera-ip/path"`.
- Livefeed zone/dwell configuration from `--config-url`, defaulting to `http://localhost:3000/api/livefeed/config`.

## Output

- MJPEG preview stream at `/stream` on the configured port.
- Detection metadata via Socket.IO, default event `detection:update`.
- HTTP fallback POST to `/api/livefeed/update`.

Example detection fields include:

```json
{
  "cameraId": "cam01",
  "timestamp": 1710000000000,
  "frameWidth": 1280,
  "frameHeight": 720,
  "peopleCount": 2,
  "activeCount": 1,
  "detections": []
}
```

## Detection Pipeline

1. Open webcam or RTSP stream with OpenCV.
2. Keep a raw MJPEG preview frame for frontend compatibility.
3. Fetch livefeed zone and dwell configuration.
4. Crop configured counting zones.
5. Run YOLO person detection on each zone.
6. Track centroids and dwell time.
7. Count a person after they remain in a zone for the configured dwell seconds.
8. Publish metadata to Socket.IO and/or HTTP.
9. Backend stores hourly analytics when MongoDB is connected.

## Dependencies

See `AI/requirements.txt`:

```text
opencv-python
ultralytics
requests
fastapi
uvicorn
numpy
python-socketio[client]
```

## Camera / RTSP Configuration

Manual RTSP command:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source "rtsp://username:password@camera-ip/path"
```

Admin-managed camera flow:

1. Add hardware in Settings with `type` set to `camera`.
2. Set `status` to `online`.
3. Provide `rtspUrl`.
4. Save settings.
5. Backend starts a detector process for the camera when configured.

## Performance Considerations

- Use `--device cuda` or `--device cuda:0` only when CUDA and a compatible NVIDIA driver are installed.
- Reduce `--imgsz` to lower latency.
- Increase `--skip-frames` to reduce inference load.
- Use `--drop-frames` and FFmpeg RTSP options to reduce buffered RTSP delay.
- Lower `--stream-width`, `--stream-fps`, or `--jpeg-quality` to reduce MJPEG bandwidth.

# Authentication & Authorization

## Login Flow

1. User submits `username` and `password` to `/login`.
2. Backend finds the user in MongoDB.
3. Password is verified with `bcrypt.compare`.
4. Backend signs a JWT with `{ id, role }` and `expiresIn: '1d'`.
5. Frontend stores `token` and `role` in `localStorage`.
6. Frontend route guards redirect unauthenticated users to `/`.

## JWT / Session

- JWT bearer tokens are accepted through the `Authorization` header.
- Backend supports both `Authorization: Bearer <token>` and raw token value.
- No server-side session store is implemented.

## IAM Integration

No active IAM integration exists in the current source code.

> **TODO:** Verify this information.

## User Roles

| Role | Behavior |
| --- | --- |
| `user` | Can access authenticated user routes such as `/home`, `/livefeed`, `/api/home`, `/api/user-map`, `/api/user/me`, and submit feedback. |
| `admin` | Can access admin dashboard, analytics, feedback management, settings, map, stations, hardware, buses, and livefeed admin APIs. |

## Permission System

The backend uses `adminMiddleware`, which checks `req.user.role === 'admin'`. There is no granular permission matrix in the active backend source.

# Development Workflow

## Branch Strategy

No branch strategy is documented in the active repository.

> **TODO:** Verify this information.

## Pull Requests

No pull request template or CI workflow was found.

> **TODO:** Verify this information.

## Code Style

- Backend uses CommonJS modules and a single Express application file.
- Frontend uses Vue single-file components and Composition API in several views.
- AI service is a standalone Python script.
- No ESLint, Prettier, Black, Ruff, or equivalent formatter configuration was found.

## Linting

No lint scripts are defined in `backend-node/package.json` or `frontend-vue/package.json`.

## Formatting

No formatting scripts are defined.

## Build Process

Frontend production build:

```bash
cd frontend-vue
npm run build
```

Frontend preview:

```bash
cd frontend-vue
npm run preview
```

Backend runtime:

```bash
cd backend-node
npm start
```

# Testing

No first-party unit, integration, or end-to-end test scripts were found in `backend-node/package.json`, `frontend-vue/package.json`, or the source tree.

| Test Type | Command | Status |
| --- | --- | --- |
| Backend unit tests | **TODO:** Verify this information. | No script found |
| Backend integration tests | **TODO:** Verify this information. | No script found |
| Frontend unit tests | **TODO:** Verify this information. | No script found |
| End-to-end tests | **TODO:** Verify this information. | No script found |
| AI service tests | **TODO:** Verify this information. | No script found |

Manual smoke checks:

```bash
cd backend-node
npm run dev
```

```bash
cd frontend-vue
npm run dev
```

```bash
curl http://localhost:3000/health
```

# Troubleshooting

## Port Already in Use

Change the backend port in `backend-node/.env`:

```env
PORT=3001
```

Then update the frontend:

```env
VITE_API_BASE_URL=http://localhost:3001
```

For AI stream conflicts, change:

```bash
python detect_humans_live-api.py --mjpeg-port 8091
```

## Missing Environment Variables

The backend exits if `JWT_SECRET` or `MONGO_URI` is missing.

```bash
cp backend-node/.env.example backend-node/.env
```

## Database Connection Failed

- Verify MongoDB is running.
- Verify `MONGO_URI`.
- For MongoDB Atlas, verify IP allowlist, username, password, and database name.
- Optionally set `MONGO_DNS_SERVERS` if DNS resolution is the issue.

## Docker Container Won't Start

No Docker configuration exists in the current repository.

> **TODO:** Verify this information.

## npm Install Errors

Try a clean install inside the affected package:

```bash
rm -rf node_modules package-lock.json
npm install
```

> **Warning:** Only remove `package-lock.json` intentionally. Keeping lockfiles is usually preferred for reproducible installs.

## Python Dependency Issues

Recreate the AI virtual environment:

```bash
cd AI
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## RTSP Camera Inaccessible

- Verify the RTSP URL and credentials.
- Confirm the camera is reachable from the machine running the AI service.
- Install FFmpeg if OpenCV cannot open the stream.
- Try TCP transport through the script's default RTSP options or override `--ffmpeg-capture-options`.

## AI Model Not Loading

- Verify `ultralytics` is installed.
- Verify the model name is valid, for example `yolov8n`, `yolov8s`, or `yolov8m`.
- Verify network access if the `.pt` weights are not already downloaded.
- Use CPU first:

```bash
python detect_humans_live-api.py --source 0 --device cpu
```

# Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/short-description
```

3. Make focused changes and keep them aligned with existing backend, frontend, or AI patterns.
4. Run available build/smoke checks.

```bash
cd frontend-vue
npm run build
```

```bash
cd backend-node
npm run dev
```

5. Use clear commit messages.

```text
feat: add station status filter
fix: handle missing livefeed config
docs: update setup guide
```

6. Open a pull request with:
   - Summary of changes.
   - Manual test evidence.
   - Screenshots for UI changes when relevant.
   - Any environment or database impact.

> **TODO:** Verify branch naming and commit message policy.

# License

No root `LICENSE` file was found.

`backend-node/package.json` declares:

```json
{
  "license": "ISC"
}
```

The frontend package does not declare a license.

> **TODO:** Verify repository-level license.

# Acknowledgements

This project uses:

- [Vue](https://vuejs.org/)
- [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Mongoose](https://mongoosejs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Leaflet](https://leafletjs.com/)
- [ApexCharts](https://apexcharts.com/)
- [Chart.js](https://www.chartjs.org/)
- [OpenCV](https://opencv.org/)
- [Ultralytics YOLO](https://docs.ultralytics.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
