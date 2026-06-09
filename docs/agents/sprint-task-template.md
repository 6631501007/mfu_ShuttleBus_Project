# NewSystem Sprint Task Template

Use this template for any NewSystem feature/change that needs agent handoff.

This template complements `docs/AI-WORKFLOW.md`. Any implementation/change handoff must also complete the T1-T20 format in `docs/templates/T1-T20-change-document.md`.

## 1. Requirement Summary

| Field | Value |
|---|---|
| Module / Feature | |
| Business goal | |
| Source request | |
| In scope | |
| Out of scope | |
| Assumptions | |
| Open questions | |

## 2. Source Evidence

| Area | File / Route / UI |
|---|---|
| Backend mounted route | |
| Backend route file | |
| Backend service/model | |
| Frontend route | |
| Frontend API wrapper | |
| Frontend store/view | |
| Existing tests | |
| Existing docs | |
| AI workflow | `docs/AI-WORKFLOW.md` |
| PRD | `docs/prd/PRD-NewSystem.md` |

## 3. Functional Requirements

| FR ID | Requirement | Actor | Priority | Notes |
|---|---|---|---|---|
| FR-NEW-001 | | | Must | |

## 4. Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-NEW-001 | FR-NEW-001 | | | |

## 5. Permission And Role Matrix

| Role / User | Path | Action | Data scope | Allowed? | Notes |
|---|---|---|---|---|---|
| NewSystem Admin | | `view/edit/delete/action/logs` | `self/unit/org` | | |

## 6. Data Contract

### Request

```json
{}
```

### Response

```json
{}
```

### Schema / Migration

| Item | Decision |
|---|---|
| Schema change | yes/no |
| Migration | yes/no |
| Seed/backfill | yes/no |
| Index | yes/no |
| Rollback | |

## 7. Task List

| Task ID | Task | Agent | Owner | Depends On | Status | Output |
|---|---|---|---|---|---|---|
| NEW-001 | Clarify scope and AC | Product Owner | | | pending | FR/AC |
| NEW-002 | Confirm data contract | Data Model | | NEW-001 | pending | contract |
| NEW-003 | Backend implementation | Backend | | NEW-002 | pending | API/tests |
| NEW-004 | Frontend implementation | Frontend | | NEW-002 | pending | UI/tests |
| NEW-005 | Security review | Security IAM | | NEW-003, NEW-004 | pending | findings |
| NEW-006 | QA/UAT | QA/UAT | | NEW-005 | pending | evidence |
| NEW-007 | Release/Ops | Release/Ops | | NEW-006 | pending | release plan |
| NEW-008 | T1-T20 and PRD/doc update | Orchestrator | | NEW-006 | pending | final handoff |

Status values:

- `pending`
- `in_progress`
- `blocked`
- `done`

## 8. Dependency Graph

```txt
Requirement
  -> Product Owner
  -> Data Model
  -> Backend + Frontend
  -> Security IAM
  -> QA/UAT
  -> Release/Ops
  -> Production
```

## 9. Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Impact | Mitigation / Decision | Owner | Status |
|---|---|---|---|---|---|---|
| R-001 | Risk | | | | | open |
| B-001 | Blocker | | | | | open |
| A-001 | Assumption | | | | | open |
| D-001 | Decision | | | | | closed |

## 10. Test Matrix

| Test ID | Type | Role/User | Precondition | Steps | Expected | Status | Evidence |
|---|---|---|---|---|---|---|---|
| TC-001 | functional | | | | | pending | |
| TC-002 | negative | | | | | pending | |
| TC-003 | permission | | | | | pending | |
| TC-004 | data scope | | | | | pending | |
| TC-005 | regression | | | | | pending | |

## 11. Verification Commands

Backend:

```bash
cd backend-node
npm test
npm run test:iam-sdk
npm run test:contracts
npm run test:all
```

Frontend:

```bash
cd frontend-vue
npm run lint
npm run test:unit
npm run test:e2e
npm run build:prod
```

Smoke:

```bash
cd backend-node
npm run smoke:live:user
```

## 12. Release Plan

| Step | Owner | Command / Action | Evidence | Rollback |
|---|---|---|---|---|
| Backup | | | | |
| Deploy backend | | | | |
| Deploy frontend | | | | |
| Run migration/seed | | | | |
| Smoke test | | | | |
| Monitor | | | | |

## 13. Entry / Exit Criteria By Agent

| Agent | Entry | Exit |
|---|---|---|
| Orchestrator | requirement with business intent | flow, tasks, owners, dependency graph |
| Product Owner | requirement summary | FR, AC, scope, role/permission matrix |
| Data Model | locked FR/AC | schema/contract/migration/rollback |
| Backend | contract ready | API/guards/tests/impact notes |
| Frontend | API contract ready | UI/store/API/tests/permission notes |
| Security IAM | implementation summary | findings and decision |
| QA/UAT | implementation + security result | test evidence and go/no-go |
| Release/Ops | QA/security sign-off | deploy, smoke, rollback, monitoring plan |

## 14. Final Handoff Summary

```txt
Feature:
Status:
Changed files:
Routes:
UI routes:
Permission:
Data migration:
Tests run:
Security decision:
QA decision:
Release decision:
Open risks:
Next owner:
```
