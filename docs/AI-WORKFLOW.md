# AI-WORKFLOW: NewSystem

อัปเดตจาก source repo `NewSystem` ณ วันที่ 2026-05-28

เอกสารนี้เป็น workflow หลักสำหรับ AI/agents ทุกตัวใน repo นี้. `docs/agents/*` คือ role instructions ส่วน `AI-WORKFLOW.md` คือ sequence, gates, evidence, test, PRD และเอกสารส่งมอบที่ทุก role ต้องทำตาม.

## 1. Operating Principle

AI ห้ามคาดเดา. ทุก requirement, route, field, permission, UI behavior, test command และ release step ต้องมาจาก source ใน repo หรือถูกบันทึกเป็น `Open Question`, `Assumption`, หรือ `Blocker` พร้อม owner.

## 2. Mandatory Rules

1. ห้ามคาดเดา ต้องอ่านข้อมูลจาก repo ก่อนเสมอ และต้องระบุ source evidence ใน output.
2. เมื่อมีการพัฒนาหรือปรับปรุง ต้องทดสอบการทำงานก่อนสรุปว่างานเสร็จ.
3. เอกสารการปรับปรุง, change note, handoff หรือ doc ใหม่ต้องใช้รูปแบบ `T1-T20`.
4. เมื่อมีการเปลี่ยนแปลง behavior, requirement, API, UI, permission, data model หรือ release impact ต้องปรับปรุง PRD ที่เกี่ยวข้อง.
5. การพัฒนาต้องเขียนตามรูปแบบเดิมของ repo ก่อนเสมอ ทั้ง backend และ frontend.
6. Frontend ต้องเขียนเป็น component-based structure: page ทำหน้าที่ orchestration, UI ย่อยแยกเป็น components.

## 3. Source Truth Order

ใช้ลำดับนี้เมื่อตรวจสอบความจริงของระบบ:

| Priority | Source | Purpose |
|---|---|---|
| 1 | Source code ที่ mounted/ถูก import จริง | behavior truth |
| 2 | Tests และ smoke scripts | expected behavior and regression coverage |
| 3 | `docs/prd/PRD-NewSystem.md` | product requirement truth |
| 4 | `docs/agents/*` | role operating instructions |
| 5 | `README.md`, `ENVIRONMENTS.md`, `DEPLOY-UBUNTU.md` | environment and delivery notes |
| 6 | older docs เช่น `backend-node/docs/IAM_PRD.md` | historical/reference only unless reconciled with source |

Route truth:

- Backend mounted route truth: `backend-node/server/routes/app.routes.js`
- Backend route implementation: `backend-node/server/Project/*/*.routes.js`
- Frontend route truth: `frontend-vue/src/router/index.js`
- Frontend API wrapper: `frontend-vue/src/service/api.js`

## 4. Workflow And Agent Integration

```txt
Requirement
  -> T1-T4 Source Discovery
  -> Agent 00 Orchestrator
  -> Agent 01 Product Owner
  -> Agent 02 Data Model
  -> Agent 03 Backend + Agent 04 Frontend
  -> T15 Implementation Summary
  -> T16 Tests / Verification
  -> Agent 05 Security IAM
  -> Agent 06 QA/UAT
  -> Agent 07 Release/Ops
  -> T17 PRD / Docs Update
  -> T20 Final Handoff
```

Backend and Frontend may run in parallel only after:

- route/API contract is locked
- request/response shape is locked
- schema/migration decision is locked
- permission path/action/data scope is locked
- test data and role assumptions are documented

## 5. Required Source Discovery

Before implementation, the acting agent must read and record the relevant files.

Backend change minimum:

- `backend-node/server/routes/app.routes.js`
- target `*.routes.js`
- target `service/*.js`
- target `controller/*.js` when applicable
- target `models/*.js` when applicable
- relevant tests and package scripts

Frontend change minimum:

- `frontend-vue/src/router/index.js`
- `frontend-vue/src/service/api.js`
- target view under `frontend-vue/src/projects/views`
- relevant components under `frontend-vue/src/projects/views/<domain>/components`
- relevant Vuex module under `frontend-vue/src/store/modules`
- relevant tests and package scripts

Docs/process change minimum:

- `AGENTS.md`
- `docs/AI-WORKFLOW.md`
- `docs/agents/README.md`
- relevant role file under `docs/agents`
- relevant PRD or template

## 6. Backend Development Pattern

Backend uses Express + CommonJS + Mongoose.

Normal simple CRUD route style follows `backend-node/server/Project/category/category.routes.js`:

- start with `'use strict';`
- `const express = require('express');`
- `const router = express.Router();`
- import `account`, `authorization`, local service
- declare permission middleware before route declarations
- call `router.use(account.onCheckAuthorization);`
- route order: list, one, create, update, delete
- keep route file thin: auth -> permission -> service handler
- export `module.exports = router;`

Permission mapping:

```txt
GET     -> view
POST    -> edit
PUT     -> edit
DELETE  -> delete
special -> action/logs only when source/PRD requires it
```

Service/controller/model pattern:

- legacy settings/category modules use service handlers named `onQuerys`, `onQuery`, `onCreate`, `onUpdate`, `onDelete`
- simple controllers often wrap `backend-node/helpers/base.service.js`
- NewSystem document service uses explicit domain functions: `list`, `stats`, `create`, `update`, `remove`, `seedDemo`
- preserve the response envelope already used by the module
- do validation/sanitization in service, not route

## 7. Frontend Development Pattern

Frontend uses Vue 2 + CoreUI + Vuex + centralized Axios wrapper.

Required pattern:

- routes live in `frontend-vue/src/router/index.js`
- protected routes use `meta.permission`
- API calls go through `frontend-vue/src/service/api.js`
- Vuex modules live under `frontend-vue/src/store/modules`
- shared project components live under `frontend-vue/src/projects/components`
- domain components live under `frontend-vue/src/projects/views/<domain>/components`
- pages should orchestrate data loading and component composition
- tables, modals, forms, sections, and repeated UI must be components
- new frontend work must prefer components over adding large monolithic page blocks

Current reusable patterns to prefer:

- section header: `src/projects/components/layout/AppSectionHero.vue`
- setting tables: `src/projects/views/setting/components/ManagementTableBase.vue`
- security tables: `src/projects/views/security/components/*Table.vue`
- modals/forms: domain `components/*Modal.vue`
- permission helpers: `src/projects/mixins/securityAccess.js`
- notifications: `src/projects/utils/notify`
- i18n labels through `$t(...)` where the surrounding module already uses i18n

If touching a legacy/monolithic page such as `NewSystemRegistry.vue`, keep the fix scoped, but new sizeable UI blocks must be extracted into domain components.

## 8. Testing Gate

No implementation is complete until tests or verification are run.

Minimum verification by scope:

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

Docs-only change:

- verify links/paths by reading generated docs
- grep/check references for stale paths
- no app test required unless behavior contract changes

If a test cannot run, final output must state:

- command not run
- exact reason
- risk left open
- owner/next action required

## 9. PRD Update Gate

Update `docs/prd/PRD-NewSystem.md` when any of these change:

- business requirement or acceptance criteria
- API endpoint, request, response, error behavior
- UI route, state, permission visibility, user workflow
- data schema, migration, seed, index, rollback
- permission path/action/data scope
- release behavior, env/config, operational process

Do not update PRD for purely internal refactors unless behavior or contract changes.

Historical `backend-node/docs/IAM_PRD.md` can be used as background only. If it conflicts with current source, current source wins and PRD must be reconciled.

## 10. T1-T20 Change Document Format

Every change note, implementation handoff, or docs update must use these sections.

| T | Section | Required content |
|---|---|---|
| T1 | Change Title | concise name, module, date |
| T2 | Requirement | user request and business goal |
| T3 | Source Evidence | repo files/routes/tests read before decision |
| T4 | Current Behavior | what source currently does |
| T5 | Impacted Agents | required agents and why |
| T6 | Scope | in scope, out of scope |
| T7 | Functional Requirements | FR IDs |
| T8 | Acceptance Criteria | AC IDs in Given/When/Then |
| T9 | API Contract | endpoints, request, response, errors |
| T10 | Data Model / Migration | schema, seed, index, rollback |
| T11 | Backend Plan / Changes | routes, guards, services, tests |
| T12 | Frontend Plan / Changes | routes, API wrapper, Vuex, components |
| T13 | Security / Permission | auth, permission, data scope, audit |
| T14 | Test Plan | test matrix and commands |
| T15 | Implementation Summary | files changed and behavior changed |
| T16 | Tests Run / Evidence | exact commands and result |
| T17 | PRD / Docs Updated | PRD/doc files changed or reason not needed |
| T18 | Risks / Blockers / Assumptions / Decisions | separated and owned |
| T19 | Release / Rollback | deploy, smoke, rollback, monitoring |
| T20 | Final Handoff | status, next owner, open items |

Template file: `docs/templates/T1-T20-change-document.md`

## 11. Done Criteria

A task is done only when:

- source evidence is recorded
- implementation follows repo style
- tests/verification are run and documented
- PRD/doc update decision is recorded
- Security/QA/Release gates are completed or explicitly marked not applicable
- T1-T20 final handoff is complete

## 12. Blocker Rules

Stop and ask for clarification when:

- required source file is missing
- backend route and frontend API wrapper disagree and compatibility cannot be proven
- permission path/action is unknown
- schema/migration impact cannot be determined from source
- tests cannot run and the change is high risk
- user request conflicts with security or release rules
