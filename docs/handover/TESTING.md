# Testing and QA Guide

This project currently has build and run scripts, but no dedicated automated test scripts are declared in `backend-node/package.json` or `frontend-vue/package.json`.

## Available Verification Commands

Backend:

```bash
cd backend-node
npm install
npm run dev
```

Frontend:

```bash
cd frontend-vue
npm install
npm run build
npm run dev
```

AI:

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python detect_humans_live-api.py --source 0 --socketio-url http://localhost:3000
```

Docker:

```bash
docker compose up --build
```

## Smoke Test Checklist

1. Backend starts without missing `JWT_SECRET` or `MONGO_URI`.
2. `GET /health` returns `200` when MongoDB is connected.
3. User registration succeeds.
4. Login returns token and user role.
5. Normal user can open `/home` and `/livefeed`.
6. Normal user is redirected from admin pages.
7. Admin can open dashboard, analytics, feedback, settings, map.
8. Station create/update/delete works.
9. Settings save works and does not return large reference images unless requested.
10. Feedback creation by user and resolution by admin works.
11. Livefeed status updates when a detector sends `detection:update`.
12. Hourly analytics records are created or updated after live detection events.
13. Docker stack starts with frontend, backend, and mongo healthy.

## Suggested API Checks

```bash
curl http://localhost:3000/health
```

Login and reuse the token:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Then:

```bash
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

## Manual UAT Areas

- Login/logout behavior
- Admin navigation and role restrictions
- Dashboard KPI and chart rendering
- Station map markers and station detail behavior
- Settings page: zones, notification settings, hardware, camera livefeed zone editor
- Livefeed stream display and overlay alignment
- Feedback submission and admin response flow
- Analytics export/report behavior if used by stakeholders

## Recommended Future Test Coverage

- Backend route tests for auth, admin authorization, validation, settings, stations, feedback, livefeed ingest.
- Frontend component/view tests for route guards and key screens.
- Socket.IO integration test for `detection:update` -> `detection:broadcast`.
- Data model tests for hourly analytics bucketing and unique index behavior.
- Docker smoke test in CI.
