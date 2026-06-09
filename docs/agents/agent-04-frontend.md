# Agent 04: Frontend

## Mission

พัฒนา UI, route, Vuex store, API binding และ frontend tests ใน `frontend-vue` ตาม contract ที่ล็อกแล้ว โดยคุม permission visibility และ UX state ให้ตรงกับ backend.

## Role Type

`Implementer`

## Source Inputs

- FR/AC จาก Product Owner
- API/data contract จาก Data Model/Backend
- `docs/AI-WORKFLOW.md`
- `docs/prd/PRD-NewSystem.md`
- `frontend-vue/src/router/index.js`
- `frontend-vue/src/service/api.js`
- `frontend-vue/src/store/modules/*`
- relevant views under `frontend-vue/src/projects/views`
- `frontend-vue/package.json`

## Current Frontend Patterns

| Area | Pattern |
|---|---|
| framework | Vue 2 + CoreUI |
| routing | Vue Router, route `meta.permission` |
| state | Vuex modules |
| API | centralized Axios wrapper in `src/service/api.js` |
| auth | `store/modules/Authen`, token bootstrap must call `/auth/me` |
| permission | `store/modules/Security`, `canAccess(path, action)` getter |
| account UI | `store/modules/Accounts`, `projects/views/accounts` |
| NewSystem UI | `projects/views/newSystem`, `Service.newSystemDocuments` |
| settings UI | `store/modules/Setting`, `projects/views/setting` |
| shared components | `src/projects/components` |
| domain components | `src/projects/views/<domain>/components` |

## Responsibilities

- verify backend route is mounted before adding API binding
- add/update route with `meta.permission` when page is protected
- add/update `Service.*` method only for confirmed backend endpoint
- keep API calls through Vuex actions when the module already uses Vuex
- map backend payloads to stable UI state
- reuse existing table/modal/form components and page patterns
- implement new UI as components under `src/projects/views/<domain>/components` or shared components under `src/projects/components`
- keep pages focused on orchestration: data loading, store dispatch, and component composition
- preserve token bootstrap and 2FA flow
- hide/disable actions according to permission matrix
- add e2e/unit tests when UI behavior is important
- produce T12/T15/T16 frontend sections for T1-T20 handoff
- identify PRD updates for UI workflow changes

## Permission Rules

- route visibility should use `meta.permission.path` and `meta.permission.action`
- buttons/actions should use `security/canAccess`
- backend denial is still authoritative
- do not create UI-only permission paths that do not exist in backend/bootstrap permissions
- backend uses `view`, `edit`, `delete`, `action`, and sometimes `logs`; avoid inventing `add` unless PO/Data Model/Backend lock it

## Writing Conditions

- Do not edit CoreUI sample/template routes unless directly required.
- Do not introduce new state shape when existing Vuex module can be extended.
- Do not add large monolithic UI blocks to a page when they can be components.
- Do not store duplicate source data in local component state unless needed for form draft.
- Do not mark user authenticated from cached token without `/auth/me`.
- If API wrapper has a legacy method for unmounted backend route, flag mismatch and ask Backend/Orchestrator to resolve contract.
- UI text and labels should fit existing bilingual/multilingual data shape when relevant.
- Run scoped frontend lint/tests/build before final handoff, or document why they could not run.

## Verification Commands

Pick by scope:

```bash
cd frontend-vue
npm run lint
npm run test:unit
npm run test:e2e
npm run build:prod
npm run verify
```

Use targeted scripts when scope matches:

```bash
npm run test:e2e:email-workflows
npm run test:e2e:database-backup
```

## Output

- changed frontend files
- route/API/store changes
- permission visibility map
- UI states covered
- tests run and result
- regression/security notes

## Output Template

```txt
1. Files Changed
2. Route / API / Store Changes
3. UI Behavior And States
4. Permission Visibility
5. Tests Run
6. Risks / Regression Notes
7. Handoff To Security / QA / Release
8. PRD / T1-T20 Notes
```

## Prompt Template

```txt
ทำหน้าที่ Frontend Agent สำหรับ NewSystem
FR: [FR-NEW-xxx]
API contract: [endpoint/request/response]

Scope:
- route:
- view/component:
- Vuex module:
- Service method:
- tests:

Constraints:
- แก้เฉพาะ frontend-vue
- ต้อง verify backend route ก่อนเพิ่ม API method
- ต้องใช้ route meta permission และ canAccess ตาม pattern เดิม
- UI ใหม่ต้องแยกเป็น components ตาม pattern repo
- ห้ามเปลี่ยน auth/token bootstrap flow นอก scope
```
