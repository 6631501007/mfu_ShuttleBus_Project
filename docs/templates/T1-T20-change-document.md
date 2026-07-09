# T1-T20 Change Document Template

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | |
| Module | |
| Date | |
| Owner / Agent | |
| Status | Draft / In Progress / Done / Blocked |
| Active Tasklist | `docs/tasks/2026-06-18-<topic>.md` |

## T2 Requirement

- User request:
- Business goal:
- Success outcome:

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/app.js` | |
| Backend module | | |
| Frontend route | `frontend-vue/src/router/index.js` | |
| Frontend API | `frontend-vue/src/service/api.js` | |
| Privacy / PDPA | visible fields, hidden fields, stored data, export behavior | |
| Tests | | |
| PRD/docs | | |

## T4 Current Behavior

- Current API behavior:
- Current UI behavior:
- Current data behavior:
- Current permission behavior:
- Current privacy/PDPA behavior:

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes/no | |
| Product Owner | yes/no | |
| Data Model | yes/no | |
| Backend | yes/no | |
| Frontend | yes/no | |
| Security IAM | yes/no | |
| QA/UAT | yes/no | |
| Release/Ops | yes/no | |

## T6 Scope

In scope:

- 

Out of scope:

- 

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-IAM-001 | | | Must |

Privacy / PDPA requirements:

- Personal data displayed:
- Personal data hidden:
- Personal data stored or changed:
- Data export/download behavior:
- Production data-minimization decision:

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-IAM-001 | FR-IAM-001 | | | |

## T9 API Contract

| Method | Endpoint | Permission | Request | Response | Error behavior |
|---|---|---|---|---|---|
| | | | | | |

Self-service / profile API contract:

| Method | Endpoint | Actor | Data changed | Sensitive fields excluded | Audit / cache behavior |
|---|---|---|---|---|---|
| | | | | | |

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | yes/no | |
| Migration | yes/no | |
| Seed/backfill | yes/no | |
| Index | yes/no | |
| Rollback | | |

## T11 Backend Plan / Changes

- Routes:
- Guards:
- Services:
- Controllers/models:
- Tests:

## T12 Frontend Plan / Changes

- Route:
- API wrapper:
- Vuex module:
- Page:
- Components:
- Visible profile/account fields:
- Hidden sensitive fields:
- Tests:

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | |
| Authorization path/action | |
| Data scope | |
| Audit | |
| Input validation | |
| Error/secret leakage | |
| Privacy / PDPA | |
| Profile/account data minimization | |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-001 | functional | | | |
| TC-002 | permission | | | |
| TC-003 | negative | | | |
| TC-004 | regression | | | |

## T15 Implementation Summary

| File | Change |
|---|---|
| | |

Tasklist progress:

| Task ID | Status | Progress % | Progress Basis | Blocker / Next Action |
|---|---|---:|---|---|
| | | | | |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| | | |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| | | |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-IAM.md` | yes/no | |
| Template docs | yes/no | |
| Other docs | yes/no | |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| R-001 | Risk | | | open |
| B-001 | Blocker | | | open |
| A-001 | Assumption | | | open |
| D-001 | Decision | | | closed |

## T19 Release / Rollback

- Release steps:
- Smoke checks:
- Monitoring:
- Rollback trigger:
- Rollback steps:

## T20 Final Handoff

```txt
Feature:
Status:
Active tasklist:
Task IDs:
Progress:
Changed files:
Routes:
UI routes:
Permission:
Data migration:
Tests run:
PRD/docs:
Security decision:
Privacy/PDPA decision:
QA decision:
Release decision:
Open risks:
Next owner:
```
