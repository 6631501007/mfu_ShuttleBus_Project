# NewSystem Agent Operating Model

อัปเดตจาก source repo `NewSystem` ณ วันที่ 2026-05-28

เอกสารชุดนี้คือ operating manual สำหรับใช้ agents พัฒนาและดูแล NewSystem. ทุก agent ต้องยึด `docs/AI-WORKFLOW.md`, source code ปัจจุบัน, route mount จริง, frontend route/API จริง และ permission model ที่มีอยู่ ไม่ใช่ prompt ทั่วไป.

## Source Documents

| Source | Purpose |
|---|---|
| `docs/AI-WORKFLOW.md` | workflow, gates, T1-T20, no-guessing/test/PRD rules |
| `docs/prd/PRD-NewSystem.md` | product requirement baseline |
| `README.md` | project overview |
| `ENVIRONMENTS.md` | environment contract |
| `DEPLOY-UBUNTU.md` | deployment notes |
| `docs/IAM-UPGRADE.md` | IAM integration notes |
| `backend-node/server/routes/app.routes.js` | mounted backend route truth |
| `backend-node/server/Project/*/*.routes.js` | module route implementation |
| `frontend-vue/src/router/index.js` | frontend route truth |
| `frontend-vue/src/service/api.js` | frontend API wrapper, must be verified against backend |

## Agent List

| Agent | Type | Primary output |
|---|---|---|
| `agent-00-orchestrator.md` | Control | execution flow, task plan, owners, dependency graph |
| `agent-01-product-owner.md` | Planner | FR, AC, scope, traceability |
| `agent-02-data-model.md` | Planner | schema/contract/migration/index/rollback |
| `agent-03-backend.md` | Implementer | routes/services/guards/tests |
| `agent-04-frontend.md` | Implementer | route/store/API/UI states/tests |
| `agent-05-security-iam.md` | Reviewer | security findings and pass/pass-with-risk/block |
| `agent-06-qa-uat.md` | Reviewer | test matrix, execution evidence, defect list |
| `agent-07-release-ops.md` | Planner | release checklist, env, smoke, rollback, monitoring |

## Default Execution Flow

```txt
User Requirement
  -> Orchestrator
  -> Product Owner
  -> Data Model
  -> Backend + Frontend
  -> Security IAM
  -> QA/UAT
  -> Release/Ops
  -> Production
```

Backend and Frontend may run in parallel only after Product Owner and Data Model have locked:

- route/API contract
- request/response shape
- schema or migration impact
- permission path/action/data scope
- role/test data assumptions

## When To Call Each Agent

| Work type | Required agents |
|---|---|
| new NewSystem feature | Orchestrator, PO, Data Model, Backend, Frontend, Security, QA, Release |
| backend-only route fix | Orchestrator, Backend, Security if protected/sensitive, QA |
| frontend-only UI fix | Orchestrator, Frontend, QA, Security if permission/sensitive data is visible |
| schema/model change | Orchestrator, PO, Data Model, Backend, QA, Release |
| permission/security change | Orchestrator, PO, Data Model if schema, Backend/Frontend, Security, QA |
| IAM integration/auth flow | Orchestrator, PO, Data Model if contract changes, Backend, Frontend, Security, QA, Release |
| operational/runtime setting | Orchestrator, Backend/Frontend if UI/API changes, Security, QA, Release |

## Global Rules For All Agents

- Follow `docs/AI-WORKFLOW.md` before role-specific instructions.
- Use source code as source of truth.
- Do not guess route, field, permission, test, component, or behavior from names alone.
- Verify backend route is mounted in `backend-node/server/routes/app.routes.js` before documenting or implementing a frontend API method.
- Every protected route must have authentication and permission decision.
- Every target-account flow must evaluate data scope.
- Preserve existing route/request/response behavior unless the FR explicitly changes it.
- Keep handoffs evidence-based: file path, endpoint, UI route, test command, migration, risk.
- Separate `decision`, `assumption`, `risk`, `blocker`, and `open question`.
- Do not turn agent output into vague advice. Every output must be executable by the next role.
- Use T1-T20 format for change docs and handoffs.
- Update `docs/prd/PRD-NewSystem.md` when behavior, API, UI, data, permission, test, or release contract changes.
- Run scoped tests/verification before marking implementation done.

## NewSystem Source Map For Agents

| Domain | Backend source | Frontend source |
|---|---|---|
| Auth/session/2FA/trusted device | `backend-node/server/Project/accounts` | `frontend-vue/src/store/modules/Authen`, `src/views/pages/Login.vue` |
| Account directory/lifecycle | `backend-node/server/Project/accounts` | `src/store/modules/Accounts`, `src/projects/views/accounts` |
| NewSystem document registry | `backend-node/server/Project/newSystem` | `src/projects/views/newSystem`, `Service.newSystemDocuments` |
| Security/RBAC/audit | `backend-node/server/Project/security` | `src/store/modules/Security`, `src/projects/views/security` |
| Settings/runtime/backup/email/HR | `backend-node/server/Project/settings` | `src/store/modules/Setting`, `src/projects/views/setting` |
| Frontend operations page | confirm backend route before API work | `src/projects/views/operations` |
| Deploy/ops | `docker-compose*.yml`, `server.sh`, `ENVIRONMENTS.md` | build env in `frontend-vue/package.json` |

## Shared Handoff Contract

Every handoff must include:

1. Scope reference: goal, FR, module, source files, assumptions
2. Contract: API route, UI route, data shape, permission path/action/scope
3. Decisions: what has been locked and why
4. Dependencies: upstream artifacts, migration, seed, env, test data
5. Risks and gaps: security, compatibility, operational, UX, data
6. Evidence: code refs, docs refs, test commands, screenshots/logs if available
7. Next owner: who can act next and what ready condition they need

## Definition Of Ready

A task is ready for implementation only when it has:

- clear FR and AC
- source area and files identified
- route/API/data contract
- permission path/action/data scope
- migration or no-migration decision
- test plan
- release/rollback impact if relevant
- source evidence recorded in T1-T4

## Definition Of Done

A task is done only when it has:

- implementation or doc change complete
- tests or verification commands run, or explicit reason not run
- security and permission impact reviewed
- docs updated when behavior/contract changes
- release notes and rollback notes when production behavior changes
- T1-T20 handoff completed

## Working Assets

- `../AI-WORKFLOW.md`: master AI workflow and gates
- `../templates/T1-T20-change-document.md`: required change documentation template
- `orchestrator-example.md`: end-to-end example using the NewSystem document registry flow
- `sprint-task-template.md`: reusable task/sprint/handoff template

## Quick Prompt

```txt
ทำงานตาม NewSystem agent workflow
Requirement: [describe request]
Source docs:
- docs/AI-WORKFLOW.md
- docs/prd/PRD-NewSystem.md
- docs/agents/README.md
- backend-node/server/routes/app.routes.js
- frontend-vue/src/router/index.js
- frontend-vue/src/service/api.js

เริ่มที่ Orchestrator แล้วส่งต่อ agent ที่จำเป็น
ต้องระบุ route, model, permission, test, release impact และ evidence จาก source
```
