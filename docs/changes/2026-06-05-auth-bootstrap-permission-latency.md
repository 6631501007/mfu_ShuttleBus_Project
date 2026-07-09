# T1-T20 Change Document: MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop Auth Bootstrap And Permission Latency

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-AUTH-PERF-20260605 |
| Module | MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop frontend auth/session/security |
| Date | 2026-06-05 |
| Status | Tested and deployed |

## T2 Requirement

- Reduce reload and app-switch latency without weakening IAM authentication or permission checks.
- Avoid unnecessary unauthenticated `/auth/me` calls when the browser has no token and no IAM session hint.
- Prevent duplicate permission bootstrap requests and premature permission denial while a request is already in flight.

## T3 Source Evidence

| Source | Evidence |
|---|---|
| `frontend-vue/src/store/modules/Authen/index.js` | Router calls `auth/bootstrapSession`; auth store owns local token/session restore. |
| `frontend-vue/src/service/session-hint.js` | Shared IAM session hint helper exists. |
| `frontend-vue/src/store/modules/Security/index.js` | `fetchMyPermissions` loads permission matrix used by route guard and menu visibility. |
| `frontend-vue/src/router/index.js` | Protected routes wait on auth and permission store before access decisions. |

## T4 Current Behavior

- Auth bootstrap skips silent restore when no local token and no IAM session hint exist.
- Auth bootstrap still uses silent restore when a token or IAM session hint exists.
- Permission bootstrap reuses the same in-flight request for concurrent callers.

## T5 Impacted Agents

| Agent | Required | Reason |
|---|---|---|
| Frontend | yes | Vuex auth and security stores changed. |
| Security IAM | yes | IAM session restore behavior changed. |
| QA/UAT | yes | Login/reload/app-switch regression must be checked. |
| Release/Ops | yes | Frontend rebuild and deploy required. |

## T6 Scope

- In scope: frontend auth bootstrap and permission loading.
- Out of scope: backend IAM token validation, role definitions, database schema.

## T7 Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | Do not call silent `/auth/me` without token or IAM session hint. |
| FR-002 | Use silent `/auth/me` when token or IAM session hint exists. |
| FR-003 | Reuse an in-flight permission request for concurrent callers. |

## T8 Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | No token and no session hint | App bootstraps | No `/auth/me` request is made. |
| AC-002 | Session hint exists | App bootstraps | Silent `/auth/me` is attempted. |
| AC-003 | Permission fetch already running | Another caller requests permissions | It waits for the existing request. |

## T9 API Contract

- No API path, payload, response, or status code changed.
- Request count changed: unnecessary unauthenticated `/auth/me` and duplicate permission calls are reduced.

## T10 Data Model / Migration

- No schema, migration, seed, or index change.

## T11 Backend Plan / Changes

- No backend code changed.

## T12 Frontend Plan / Changes

| File | Change |
|---|---|
| `frontend-vue/src/store/modules/Authen/index.js` | Added session hint gate before silent auth restore. |
| `frontend-vue/src/store/modules/Security/index.js` | Added in-flight promise reuse for permission fetch. |
| `frontend-vue/tests/unit/store/modules/Authen.spec.js` | Added no-session and session-hint bootstrap tests. |
| `frontend-vue/tests/unit/store/modules/Security.index.spec.js` | Added concurrent permission fetch test. |

## T13 Security / Permission

- Backend authorization remains authoritative.
- UI permission checks still use the same permission matrix.
- The change reduces duplicate calls but does not grant or broaden access.

## T14 Test Plan

| Test | Result |
|---|---|
| Targeted eslint on changed files | pass |
| `npm run test:unit -- --runTestsByPath tests/unit/store/modules/Authen.spec.js tests/unit/store/modules/Security.index.spec.js` | pass, 4 tests |
| `npm run build:prod` | pass |

## T15 Implementation Summary

- Skip no-op silent auth when the browser has no session signal.
- Reuse the same permission promise so route guards do not race permission loading.

## T16 Tests Run / Evidence

- Targeted unit tests passed.
- Production build passed.
- Server deploy completed on `192.168.17.25`; `mfushuttlebusaibasepassengercountingandanalysis-backend-1` reported healthy and `mfushuttlebusaibasepassengercountingandanalysis-frontend-1` was recreated after syncing `frontend-vue/src/projects/utils/permission-landing.js`.
- Server smoke passed: `http://127.0.0.1:8086/` returned 200 in about 0.002s; `http://127.0.0.1:8210/api/v1/auth/me` returned unauthenticated 401 in about 0.015s.
- Public smoke blocked: `https://mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.mfu.ac.th/` and `https://mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.mfu.ac.th/api/v1/auth/me` did not resolve from this machine.
- Watchman recrawl warning appeared during tests; it did not fail tests.

## T17 PRD / Docs Updated

- `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md` updated.
- This T1-T20 document added.

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Status |
|---|---|---|---|
| A-001 | Assumption | Real Google login UAT still requires an authorized browser session. | open |
| B-001 | Blocker | `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.mfu.ac.th` DNS did not resolve from this machine during public smoke. | open |
| D-001 | Decision | Use session hint as the signal for cookie-based IAM restore. | closed |

## T19 Release / Rollback

- Release: rebuilt and deployed MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop frontend on `192.168.17.25`; public DNS still needs Ops confirmation.
- Smoke: app shell 200, `/api/v1/auth/me` unauthenticated 401, login/reload/app-switch UAT.
- Rollback: revert frontend auth/security store changes and rebuild.

## T20 Final Handoff

Status: tested and deployed on the server. Public DNS for `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.mfu.ac.th` remains blocked from this machine. No backend or data migration required.
