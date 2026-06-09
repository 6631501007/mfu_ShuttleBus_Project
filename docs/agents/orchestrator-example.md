# Orchestrator Example: NewSystem Document Registry Change

## Scenario

Requirement:

เพิ่ม field ใหม่ในเอกสาร NewSystem Registry ให้ admin บันทึก, แก้ไข, ค้นหา และดูสถิติได้ โดยต้องคุม permission และไม่ทำให้รายการเอกสารเดิมเสีย behavior.

Source areas:

- Backend: `backend-node/server/Project/newSystem`
- Frontend: `frontend-vue/src/projects/views/newSystem`, `frontend-vue/src/service/api.js`
- Security model: `/newsystem/registry:view/edit/delete`, `/newsystem/reports:view`
- Tests: backend Node test runner, frontend unit/e2e by scope
- Workflow: `docs/AI-WORKFLOW.md`
- PRD: `docs/prd/PRD-NewSystem.md`

## 1. Requirement Summary

Goal:

- เพิ่มข้อมูลที่ต้องใช้ใน document registry โดยรักษา API/UI เดิมและ permission เดิม

In scope:

- schema field and migration decision
- list/create/update/delete payload support
- registry UI form/table/search update
- stats impact if field participates in reporting
- permission and regression tests

Out of scope:

- redesign registry page
- new IAM role model
- unrelated settings or account changes

## 2. Agent Execution Flow

```txt
Orchestrator
  -> Product Owner
  -> Data Model
  -> Backend + Frontend
  -> Security IAM
  -> QA/UAT
  -> Release/Ops
```

Backend and Frontend can run in parallel after Data Model confirms the field contract and migration/backfill decision.

## 3. Task List

| Task ID | Task | Owner | Depends On | Output |
|---|---|---|---|---|
| NEW-DOC-001 | Define FR/AC and role matrix | Product Owner | Requirement | FR + AC |
| NEW-DOC-002 | Confirm schema, contract, migration | Data Model | NEW-DOC-001 | contract/migration note |
| NEW-DOC-003 | Implement backend service/model support | Backend | NEW-DOC-002 | API + tests |
| NEW-DOC-004 | Implement frontend form/table/API state | Frontend | NEW-DOC-002 | UI + tests |
| NEW-DOC-005 | Review permission, validation, audit risk | Security IAM | NEW-DOC-003, NEW-DOC-004 | findings/decision |
| NEW-DOC-006 | Execute AC and regression tests | QA/UAT | NEW-DOC-005 | pass/fail evidence |
| NEW-DOC-007 | Prepare release and rollback plan | Release/Ops | NEW-DOC-006 | release checklist |
| NEW-DOC-008 | Complete T1-T20 and PRD update | Orchestrator | NEW-DOC-006 | final handoff |

## 4. Traceability

| Goal | FR | API | UI | Permission | Test |
|---|---|---|---|---|---|
| Maintain registry field | FR-NEW-001 | `GET/POST/PUT/DELETE /api/v1/newSystem/documents*` | `/newSystem/registry` | `/newsystem/registry:view/edit/delete` | backend + frontend targeted tests |
| Report field if needed | FR-NEW-002 | `GET /api/v1/newSystem/documents/stats` | registry dashboard widgets | `/newsystem/reports:view` | stats regression |

## 5. Dependency Graph

```txt
Requirement
  -> PO: FR/AC
  -> Data Model: field contract and migration decision
  -> Backend: model/service/API behavior
  -> Frontend: form/table/search/stats state
  -> Security: permission/validation review
  -> QA: AC + regression
  -> Release: deploy + smoke + rollback
```

## 6. Risks And Controls

| Type | Description | Control | Owner |
|---|---|---|---|
| Risk | existing documents miss new field | default/backfill decision | Data Model |
| Risk | unauthorized user mutates registry | require `/newsystem/registry:edit/delete` | Backend + Security |
| Risk | UI sends field not accepted by backend | lock request/response contract first | Backend + Frontend |
| Risk | stats changes alter existing dashboard | targeted stats regression | QA |
| Decision | preserve response envelope | keep `{ code, message, data }` unless FR changes it | Backend |

## 7. Security Review Focus

- routes have `account.onCheckAuthorization`
- route permission paths match `/newsystem/registry` and `/newsystem/reports`
- ObjectId and payload validation are safe
- mutation cannot bypass edit/delete permission
- frontend button visibility matches backend permission
- errors do not leak stack traces

## 8. QA Matrix

| Case | Steps | Expected |
|---|---|---|
| create success | admin creates document with new field | field saved and shown |
| update success | admin edits field | field updates without dropping old data |
| list/search | admin filters or views list | expected rows returned |
| stats | admin opens report widgets | stats remain correct |
| unauthorized create | user without edit calls endpoint | 403 or denied behavior |
| migration/backfill | existing record loads | UI/API handle missing field safely |

## 9. Release Checklist

- backend/frontend tests selected by scope
- migration/backfill script reviewed if required
- permission bootstrap reviewed if new permission path/action is introduced
- smoke: sign in, registry list, create/update/delete if safe in target env
- rollback: revert code and restore data from backup if migration is destructive
- docs: update `docs/prd/PRD-NewSystem.md` and complete T1-T20 handoff

## 10. Orchestrator Summary Output

```txt
Status: ready for implementation after Data Model sign-off
Parallel allowed: Backend + Frontend after contract is locked
Security gate: required
QA gate: required
Release gate: required if schema or permission changes
```
