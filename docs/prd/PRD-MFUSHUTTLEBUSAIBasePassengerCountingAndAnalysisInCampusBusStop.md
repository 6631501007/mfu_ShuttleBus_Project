# PRD: MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop

## Document Control

| Field | Value |
|---|---|
| Product | MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop |
| Project code | mfushuttlebusaibasepassengercountingandanalysis |
| Version | 0.1 |
| Status | Source-Aligned Baseline |
| Source checked date | 2026-07-08 |
| Related workflow | `docs/AI-WORKFLOW.md` |
| Related agents | `docs/agents/README.md` |
| Public domain | `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.mfu.ac.th` |

## Source Truth

This PRD must stay aligned with current source. If source and PRD conflict, source wins until PRD is updated. Do not infer behavior from this document without checking the linked source files.

| Area | Source |
|---|---|
| Backend mounted routes | `backend-node/app.js` |
| Backend module routes | `backend-node/app.js route handlers` |
| Backend package scripts | `backend-node/package.json` |
| Frontend routes | `frontend-vue/src/router/index.js` |
| Frontend API wrapper | `frontend-vue/src/service/api.js` |
| Frontend stores | `frontend-vue/src/router/index.js and localStorage-backed view state` |
| Frontend package scripts | `frontend-vue/package.json` |
| Environment notes | `README.md`, `backend-node/.env.example`, `frontend-vue/.env.example` |

## Product Overview

MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop is a shuttle bus stop passenger monitoring and analysis application. It combines a Vue frontend, Node.js/Express API, MongoDB/Mongoose models, Socket.IO live updates, and a Python YOLOv8 AI service for live camera-based passenger counting.

Detected package names at generation time:

| Runtime | Package |
|---|---|
| Backend | `backend` package under `backend-node/package.json` |
| Frontend | `frontend` package under `frontend-vue/package.json` |

## Mounted Backend Route Evidence

The active backend route handlers live in `backend-node/app.js`. Re-read the file before changing behavior.

- Public auth: `POST /register`, `POST /login`
- Authenticated APIs: `/api/user/me`, `/api/user-map`, `/api/map`, `/api/dashboard`, `/api/feedback`
- Admin APIs: `/api/settings`, `/api/settings/hardware`, `/api/stations`, `/api/buses`, `/api/analytics`
- Live feed APIs: `/api/livefeed/*`

## Backend Source Areas

| auth/users | `backend-node/app.js`, `backend-node/models/user.js` |
| station map | `backend-node/app.js`, `backend-node/models/station.js`, `backend-node/models/bus.js` |
| dashboard/analytics | `backend-node/app.js`, `backend-node/models/analytics.js`, `backend-node/models/hourlyAnalytics.js` |
| feedback | `backend-node/app.js`, `backend-node/models/feedback.js` |
| settings/livefeed | `backend-node/app.js`, `backend-node/models/setting.js` |

## Frontend Source Areas

| auth | `frontend-vue/src/views/Login.vue` |
| dashboard | `frontend-vue/src/views/Dashboard.vue` |
| station map | `frontend-vue/src/views/Map.vue`, `frontend-vue/src/views/Home.vue` |
| livefeed | `frontend-vue/src/views/Livefeed.vue`, `frontend-vue/src/views/Setting.vue` |
| analytics | `frontend-vue/src/views/Analytics.vue` |
| feedback | `frontend-vue/src/views/Feedback.vue` |

## Functional Baseline

### FR-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-001 Authentication And Session

Registration and login use JWT authentication from `backend-node/app.js`. The frontend stores token and role in `localStorage`; protected frontend routes must check that state before allowing access.

### FR-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-002 Account Directory And Lifecycle

User profile behavior must use `GET /api/user/me` and must not expose sensitive fields beyond what the current backend returns.

### FR-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-003 Project Business Workflows

Project workflows must be defined from `backend-node/app.js`, `frontend-vue/src/router/index.js`, and `frontend-vue/src/service/api.js`.

### FR-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-004 Security And Permission Management

Protected routes require authentication. Admin routes and APIs must preserve the current admin role checks unless a source-backed permission model is added.

### FR-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-005 Settings And Operations

Settings, station/hardware management, livefeed camera configuration, analytics, and feedback behavior must be verified from current settings routes/views and deployment files before release.

## Non-Functional Requirements

| Area | Requirement |
|---|---|
| Source discipline | read source before planning or coding; record evidence in T1-T20 docs |
| Security | protect API and UI by JWT/session/admin-role checks |
| Maintainability | follow current repo style before adding abstractions |
| Frontend structure | new sizeable UI must be component-based |
| Compatibility | preserve existing API/response shape unless FR explicitly changes it |
| Testing | run scoped tests/E2E/smoke before claiming completion |
| Documentation | update PRD and T1-T20 handoff when behavior, API, UI, permission, data, env, or release contract changes |

## PRD Update Rules

Update this PRD when any change affects:

- requirement or acceptance criteria
- API endpoint, request, response, or error behavior
- frontend route, page behavior, component workflow, or navigation
- schema, migration, seed, index, rollback, or data ownership
- permission path/action/data scope
- environment, deploy, rollback, smoke, or monitoring behavior
- test or release expectation
