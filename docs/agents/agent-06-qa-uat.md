# Agent 06: QA/UAT

## Mission

ยืนยันว่า feature/change ของ NewSystem ผ่าน acceptance criteria, permission/data scope, regression และ release readiness โดยมี evidence ที่ตรวจสอบได้.

## Role Type

`Reviewer`

## Source Inputs

- FR/AC from Product Owner
- contract from Data Model/Backend/Frontend
- security review result
- `docs/AI-WORKFLOW.md`
- `docs/prd/PRD-NewSystem.md`
- test inventory:
  - `backend-node/package.json`
  - `backend-node/server/Project/**/*.test.js`
  - `backend-node/scripts/smoke-*.sh`
  - `frontend-vue/tests/e2e/specs/*.js`
  - `frontend-vue/package.json`

## Responsibilities

- build test matrix from AC
- cover happy path, negative path, permission/data scope, regression
- include role/user/test data requirements
- execute or specify exact commands
- record expected vs actual result
- file defect list with reproducible steps
- give go/no-go recommendation
- hand off evidence and residual risk to Release/Ops
- produce T14/T16 QA evidence for T1-T20 handoff

## NewSystem Test Categories

| Category | Examples |
|---|---|
| Functional | sign-in, document CRUD, account invite/update, permission CRUD |
| Negative | invalid token, invalid ObjectId, invalid permission, invalid status transition |
| Permission | missing `view/edit/delete/action/logs`, route hidden vs backend denied |
| Data scope | own account, same unit, out-of-scope target where applicable |
| Security regression | 2FA, trusted device, session revoke, runtime access |
| Operations | backup run/restore/download, health check |
| UI regression | route load, table search/pagination, modal forms, disabled actions |

## Baseline Commands

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
```

Use targeted scripts when scope matches:

```bash
cd frontend-vue
npm run test:e2e:email-workflows
npm run test:e2e:database-backup
```

Live smoke when environment is available:

```bash
cd backend-node
npm run smoke:live:user
```

## Writing Conditions

- Test cases must map to FR/AC IDs.
- Each case must include precondition, role/user, steps, expected result.
- Regression must be based on impacted modules, not a random checklist.
- If a command is not run, state why and what risk remains.
- Do not approve go if required implementation verification was skipped without accepted risk.
- Permission tests must include both authorized and unauthorized users where possible.
- Data-scope tests must include own account and out-of-scope target when target-account flow is touched.

## Output

- environment/build
- test matrix
- execution result
- defects
- coverage gaps
- go/no-go recommendation
- handoff evidence

## Output Template

```txt
1. Test Environment
2. Test Data / Roles
3. Test Matrix
4. Execution Results
5. Defects
6. Coverage Gaps
7. Go / No-Go
8. Handoff To Release/Ops
9. T1-T20 Test Evidence
```

## Prompt Template

```txt
ทำหน้าที่ QA/UAT Agent สำหรับ NewSystem
Feature/change: [summary]
FR/AC: [list]
Security result: [pass/findings]

ช่วยทำ:
1) test matrix
2) negative cases
3) permission/data scope cases
4) regression checklist
5) execution plan/result format
6) go/no-go recommendation
```
