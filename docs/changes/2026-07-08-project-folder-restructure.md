# T1-T20 Change Document: Project Folder Restructure

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | 2026-07-08-project-folder-restructure |
| Module | project structure |
| Date | 2026-07-08 |
| Owner / Agent | AI |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-08-project-folder-restructure.md` |

## T2 Requirement

- User request: ปรับโครงสร้างของ project ตาม folder doc
- Business goal: Make source folders and docs references consistent enough for future AI workflow use.
- Success outcome: Main source folders use docs-controlled names, frontend imports still resolve, and docs point to current source truth.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/app.js` | Current backend is a single Express app with route handlers. |
| Backend models | `backend-node/models/*` | Mongoose model directory exists under renamed backend folder. |
| Frontend route | `frontend-vue/src/router/index.js` | Vue Router path remains in the renamed frontend folder. |
| Frontend API | `frontend-vue/src/service/api.js` | API helper moved to docs-expected service folder. |
| Tests | `backend-node/package.json`, `frontend-vue/package.json` | Frontend has `build`; backend has `start` and `dev` only. |
| PRD/docs | `docs/AI-WORKFLOW.md`, `docs/tasks/README.md`, `docs/prd/*` | Docs control paths were reviewed and updated. |

## T4 Current Behavior

- Current API behavior: Express routes live in `backend-node/app.js`.
- Current UI behavior: Vue views import API helper from `frontend-vue/src/service/api.js`.
- Current data behavior: No schema or migration change.
- Current permission behavior: No permission logic change.
- Current privacy/PDPA behavior: No personal data field behavior changed.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Coordinates folder and docs structure. |
| Product Owner | no | No functional requirement change. |
| Data Model | no | No schema change. |
| Backend | yes | Backend folder path changed. |
| Frontend | yes | Frontend folder path and API helper path changed. |
| Security IAM | no | No auth/permission behavior change. |
| QA/UAT | yes | Build/render verification required. |
| Release/Ops | yes | Local commands now use renamed folders. |

## T6 Scope

In scope:

- Rename `backend/` to `backend-node/`.
- Rename `frontend/` to `frontend-vue/`.
- Move frontend API helper to `frontend-vue/src/service/api.js`.
- Update README, workflow docs, task progress, templates, and PRD source references.
- Add the missing tasklist progress HTML render script.

Out of scope:

- Refactor backend into a generated `server/Project` architecture.
- Add IAM modules that do not exist in current source.
- Change API behavior, database schema, permissions, or UI features.

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-FOLDER-001 | Source folder names must match docs-controlled backend/frontend names. | Developer / AI | Must |
| FR-FOLDER-002 | Docs source truth must point to files that exist in this repository. | Developer / AI | Must |

Privacy / PDPA requirements:

- Personal data displayed: unchanged.
- Personal data hidden: unchanged.
- Personal data stored or changed: unchanged.
- Data export/download behavior: unchanged.
- Production data-minimization decision: not applicable.

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-FOLDER-001 | FR-FOLDER-001 | The repo is checked out | A developer opens the root | `backend-node/` and `frontend-vue/` are present as source folders. |
| AC-FOLDER-002 | FR-FOLDER-002 | A workflow agent reads docs | It follows source truth references | Referenced backend/frontend source files exist. |

## T9 API Contract

No API contract change.

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | no | Folder-only/docs-only change. |
| Migration | no | No persisted data touched. |
| Seed/backfill | no | No data touched. |
| Index | no | No schema touched. |
| Rollback | Rename folders back and restore import paths if needed. | |

## T11 Backend Plan / Changes

- Routes: no route behavior change; source path is now `backend-node/app.js`.
- Guards: unchanged.
- Services: unchanged.
- Controllers/models: model files moved with folder rename only.
- Tests: backend has no test script; runtime smoke needs configured env/database.

## T12 Frontend Plan / Changes

- Route: unchanged under `frontend-vue/src/router/index.js`.
- API wrapper: moved to `frontend-vue/src/service/api.js`.
- Vuex module: not present in current source.
- Page: import paths updated.
- Components: import paths updated.
- Visible profile/account fields: unchanged.
- Hidden sensitive fields: unchanged.
- Tests: frontend build verification.

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | unchanged |
| Authorization path/action | unchanged |
| Data scope | unchanged |
| Audit | unchanged |
| Input validation | unchanged |
| Error/secret leakage | unchanged |
| Privacy / PDPA | no personal-data behavior change |
| Profile/account data minimization | unchanged |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-001 | build | developer | Run `npm run build` in `frontend-vue`. | Build succeeds with new import paths. |
| TC-002 | docs | developer | Run `node scripts/render-tasklist-progress-html.js .`. | HTML progress report regenerates. |
| TC-003 | static | developer | Search for stale source folder paths. | No active docs/source references old source folders. |

## T15 Implementation Summary

| File | Change |
|---|---|
| `backend-node/` | Renamed from `backend/`. |
| `frontend-vue/` | Renamed from `frontend/`. |
| `frontend-vue/src/service/api.js` | Moved from `frontend-vue/src/lib/api.js`. |
| `README.md` | Updated setup and structure paths. |
| `docs/*` | Updated active workflow/source truth references. |
| `scripts/render-tasklist-progress-html.js` | Added docs render script. |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-FOLDER-001 | verifying | 80 | discovery, implementation, docs update complete | run verification |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `node -c app.js` in `backend-node` | pass | Backend entrypoint syntax check passed. |
| `node -c models/*.js` in `backend-node` | pass | Backend model syntax checks passed. |
| `npm run build` in `frontend-vue` | pass | Vite production build completed with new import paths. |
| `node scripts/render-tasklist-progress-html.js .` | pass | Regenerated `docs/tasks/tasklist-progress.html`. |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| Backend runtime smoke | Requires configured `backend-node/.env` and MongoDB. | Backend startup after rename remains manually verified unless env is available. |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md` | yes | Source truth paths updated. |
| Template docs | yes | Backend/frontend source truth paths updated. |
| Other docs | yes | README/workflow/task progress updated. |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| R-001 | Risk | Backend has no test script and runtime requires env/database. | AI / developer | open |
| D-001 | Decision | Keep backend source shape in `app.js` instead of creating fake generated route folders. | AI | closed |

## T19 Release / Rollback

- Release steps: deploy renamed folder layout and update any external scripts that still call `backend/` or `frontend/`.
- Smoke checks: frontend build; backend start with configured env; route smoke.
- Monitoring: watch frontend asset build and backend startup logs.
- Rollback trigger: deployment scripts require old folder names and cannot be updated in time.
- Rollback steps: rename `backend-node/` to `backend/`, `frontend-vue/` to `frontend/`, and restore docs/import paths.

## T20 Final Handoff

```txt
Feature: Project folder restructure
Status: Done
Active tasklist: docs/tasks/2026-07-08-project-folder-restructure.md
Task IDs: mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-FOLDER-001
Progress: 100
Changed files: backend-node/, frontend-vue/, README.md, docs/*, scripts/render-tasklist-progress-html.js
Routes: no API route behavior change
UI routes: no UI route behavior change
Permission: unchanged
Data migration: none
Tests run: backend node -c checks; npm run build in frontend-vue; node scripts/render-tasklist-progress-html.js .
PRD/docs: updated
Security decision: no security behavior change
Privacy/PDPA decision: no personal-data behavior change
QA decision: frontend build and docs render passed
Release decision: update external scripts to use backend-node/frontend-vue
Open risks: backend runtime smoke needs env/database
Next owner: AI
```
