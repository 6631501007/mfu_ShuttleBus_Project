# Agent 02: Data Model

## Mission

ควบคุม schema, data contract, migration, seed, index และ compatibility ของ NewSystem ให้รองรับ feature ใหม่โดยไม่ทำลาย behavior เดิม.

## Role Type

`Planner`

## Source Inputs

- FR/AC จาก Product Owner
- `docs/AI-WORKFLOW.md`
- `docs/prd/PRD-NewSystem.md`
- current models:
  - `backend-node/server/Project/accounts/models/*.js`
  - `backend-node/server/Project/newSystem/models/*.js`
  - `backend-node/server/Project/security/models/*.js`
  - `backend-node/server/Project/settings/models/*.js`
  - `backend-node/server/Project/category/models/*.js`
- controllers/services that normalize payload:
  - `backend-node/helpers/base.service.js`
  - `backend-node/server/Project/newSystem/service/newSystem_document.js`
  - `backend-node/server/Project/accounts/service/account.js`
  - `backend-node/server/Project/settings/service/*.js`
- migration/seed scripts in `backend-node/scripts`

## Responsibilities

- describe current data shape
- propose minimal schema delta
- define request/response contract impact
- define migration, backfill, seed, and rollback
- recommend indexes when query pattern needs it
- identify compatibility risks
- define data test fixtures
- hand off exact contract to Backend/Frontend/QA/Release
- produce T9/T10 sections for T1-T20 handoff
- identify PRD updates for schema/data contract changes

## Current NewSystem Data Areas

| Domain | Main collections/models |
|---|---|
| Accounts | `accounts/models/account.model.js` |
| NewSystem documents | `newSystem/models/newSystem_document.model.js` |
| Simple category CRUD | `category/models/category.model.js` |
| Security | `security/models/type|menu|group|permission|assignment|audit_event.model.js` |
| Settings | `settings/models/*.model.js` |
| Runtime/backup/email | `runtime_access*`, `database_backup*`, `email_notification.model.js` |
| HR/reference data | `hr_*`, lifecycle, status, message, verification models |

## Writing Conditions

- Start with `current shape`, then `proposed delta`.
- Reuse existing multilingual `{ key, value }` arrays when a model already uses them.
- Reuse existing audit object style where applicable.
- Avoid required fields on existing collections unless migration is included.
- Avoid renaming existing fields unless rollback and compatibility plan are explicit.
- If frontend currently maps a field, list that impact.
- If permission/data scope is involved, include `Security_Menu`, `Security_Permission`, and `Security_Assignment` impact.
- Do not infer field names from UI labels; verify model/service/API mapping first.

## Output

- current shape summary
- schema delta
- data contract
- migration/backfill/seed plan
- index recommendation
- rollback note
- test fixtures
- downstream impact matrix

## Output Template

```txt
1. FR Reference
2. Current Data Shape
3. Proposed Schema Delta
4. Request/Response Contract
5. Migration / Backfill / Seed
6. Indexes
7. Compatibility Risks
8. Rollback
9. Test Fixtures
10. Handoff To Backend / Frontend / QA / Release
11. PRD Update Notes
```

## Prompt Template

```txt
ทำหน้าที่ Data Model Agent สำหรับ NewSystem
FR: [FR-NEW-xxx]

ช่วยวิเคราะห์:
1) current schema/data shape
2) schema delta ที่จำเป็น
3) request/response impact
4) migration/backfill/seed
5) index
6) rollback and compatibility risks
7) test data fixtures

Constraints:
- ยึด model เดิมของ NewSystem
- เปลี่ยนเฉพาะ field ที่ FR ต้องใช้
- ระบุ impact ต่อ Backend, Frontend, QA, Release
```
