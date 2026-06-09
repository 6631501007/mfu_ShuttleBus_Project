# Agent 03: Backend

## Mission

พัฒนา API, route guard, business logic, integration และ tests ใน `backend-node` ตาม FR และ data contract โดยรักษา behavior เดิม.

## Role Type

`Implementer`

## Source Inputs

- FR/AC จาก Product Owner
- data contract/migration note จาก Data Model
- `docs/AI-WORKFLOW.md`
- `docs/prd/PRD-NewSystem.md`
- `backend-node/server/routes/app.routes.js`
- relevant route/service/controller/model files
- `backend-node/server/Project/category/category.routes.js` as the simple CRUD route style reference
- `backend-node/package.json`

## Current Backend Patterns

| Layer | Pattern |
|---|---|
| route | Express router maps path to handlers and guards |
| mounted route truth | `backend-node/server/routes/app.routes.js` |
| simple CRUD route | `category.routes.js` pattern |
| auth guard | `account.onCheckAuthorization` / `Account.onCheckAuthorization` for protected human endpoints |
| permission guard | `authorization.requirePermission(path, action, options)` |
| service | route handlers and business logic |
| controller | base CRUD wrapper around Mongoose model via `helpers/base.service.js` |
| model | Mongoose schema |
| response | legacy modules often use settings message response service; `newSystem` routes use direct `{ code, message, data }` JSON |
| tests | Node test runner through package scripts |

## Mounted Route Truth

| Mount | Module |
|---|---|
| `/api/v1/newSystem` | `Project/newSystem/newSystem.routes.js` |
| `/api/v1/setting` | `Project/settings/settings.routes.js` |
| `/api/v1/security` | `Project/security/security.routes.js` |
| `/api/v1` | `Project/accounts/accounts.routes.js` |

If a route file is not mounted here, it is not reachable until mount is added.

Note: `frontend-vue/src/service/api.js` currently calls the document API with lowercase `/api/v1/newsystem`. Verify Express case-sensitivity and preserve compatibility before changing route casing.

## Responsibilities

- implement route/service/model changes within scope
- ensure mounted route path exists under `/api/v1`
- apply auth and permission guards
- enforce data scope for target-account flows
- validate/sanitize inputs in service layer
- preserve response shapes unless contract changes
- write or update focused tests
- add migration/seed scripts only when Data Model requested
- document curl/test commands and regression risks
- produce T11/T15/T16 backend sections for T1-T20 handoff
- identify PRD updates for API/behavior changes

## Security Baseline

Protected human endpoint must have:

```txt
account.onCheckAuthorization
  -> authorization.requirePermission(path, action, targetAccountId?)
  -> service handler
```

High-risk examples:

- account status/provision/deprovision: `action`
- permission/menu/group/type mutation: `edit/delete`
- audit read: `view` on `/security/audit`
- runtime access update: `edit/action`
- backup restore/download/run: `action`
- document registry mutation: `edit/delete` on `/newsystem/registry`

## Simple CRUD Route Rules

Use this pattern for normal modules such as category, role, department, or other management CRUD.

```js
'use strict';

const express = require('express');
const router = express.Router();

const account = require('../accounts/service/account');
const authorization = require('../security/service/authorization');
const role = require('./service/role');

const canViewRole = authorization.requirePermission('/management/role', 'view');
const canEditRole = authorization.requirePermission('/management/role', 'edit');
const canDeleteRole = authorization.requirePermission('/management/role', 'delete');

router.use(account.onCheckAuthorization);

router.get('/', canViewRole, role.onQuerys);
router.get('/one', canViewRole, role.onQuery);
router.post('/', canEditRole, role.onCreate);
router.put('/', canEditRole, role.onUpdate);
router.delete('/', canDeleteRole, role.onDelete);

module.exports = router;
```

CRUD permission mapping:

```txt
GET     -> view
POST    -> edit
PUT     -> edit
DELETE  -> delete
```

Keep existing handler names, including `onQuerys`. Do not rename to `onQueries` unless the service layer and all callers are intentionally migrated together.

## Writing Conditions

- Do not put business logic in route files.
- Route files should only wire authentication, permission middleware, and service handlers.
- Do not guess endpoint reachability; verify mount in `app.routes.js`.
- Do not add new global middleware without explicit scope.
- Keep changes inside `backend-node` unless task says otherwise.
- Reuse `authorization`, `iam-admin-client`, `base.service`, and existing controller patterns.
- For session/2FA/trusted-device flows, preserve token/session cleanup semantics.
- If a route exists only in frontend API wrapper but not mounted in backend, do not implement against the wrapper without adding/confirming backend route.
- Preserve existing response envelope per module unless the contract explicitly changes.
- Run scoped backend tests or syntax checks before final handoff.

## Verification Commands

Pick by scope:

```bash
cd backend-node
npm test
npm run test:iam-sdk
npm run test:contracts
npm run test:all
npm run smoke:live:user
```

For syntax-only checks on touched files:

```bash
cd backend-node
node -c server/Project/<module>/<file>.js
```

## Output

- changed backend files
- routes and guards added/changed
- data contract implemented
- tests run and result
- curl/Postman examples if useful
- security/regression/release notes

## Output Template

```txt
1. Files Changed
2. API Routes And Guards
3. Business Logic Changes
4. Data Contract / Migration
5. Tests Run
6. Security And Regression Notes
7. Handoff To Frontend / Security / QA / Release
8. PRD / T1-T20 Notes
```

## Prompt Template

```txt
ทำหน้าที่ Backend Agent สำหรับ NewSystem
FR: [FR-NEW-xxx]
Data contract: [summary]

Scope:
- routes:
- services:
- models/controllers:
- tests:

Constraints:
- แก้เฉพาะ backend-node
- ทุก protected route ต้องมี auth guard และ permission guard
- target account ต้องมี data scope check
- route CRUD ปกติให้ยึด category.routes.js style
- ห้ามเปลี่ยน behavior เดิมนอก scope
- ต้องสรุป tests และ security impact
```
