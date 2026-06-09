# T1-T20 Change Document: AI Workflow And Agent Operating Model

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | DOC-AI-WORKFLOW-20260528 |
| Module | Docs / Agents / AI Workflow |
| Date | 2026-05-28 |
| Owner / Agent | Codex |
| Status | Done |

## T2 Requirement

- User request: create `AI-WORKFLOW`, align agents with the repo, add mandatory no-guessing, testing, T1-T20 docs, PRD update, repo-style development, and component-based frontend rules.
- Business goal: make AI workflow and role agents work together as a complete delivery process for NewSystem.
- Success outcome: agents know what to read, how to plan, how to implement, how to test, when to update PRD, and how to hand off work.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Existing agent examples | `/Users/m-vibe/masters/docs/agents/*.md` | agent structure and role format |
| Existing PRD template | `/Users/m-vibe/masters/docs/prd/templates/PRD-Master-Data-Module-Template.md` | source-evidence-first PRD style |
| Repo overview | `README.md`, `TEMPLATE.md` | NewSystem purpose, run commands, IAM setup |
| Current PRD | `backend-node/docs/IAM_PRD.md` | historical IAM/backend PRD exists but may conflict with mounted routes |
| Backend route truth | `backend-node/server/routes/app.routes.js` | mounted routes under `/api/v1` |
| Backend route patterns | `backend-node/server/Project/category/category.routes.js`, `settings.routes.js`, `newSystem.routes.js` | route guard and service wiring patterns |
| Backend services/models | `newSystem_document.js`, `newSystem_document.model.js`, `helpers/base.service.js` | explicit service and base CRUD patterns |
| Frontend route/API | `frontend-vue/src/router/index.js`, `frontend-vue/src/service/api.js` | route meta permission and centralized API wrapper |
| Frontend components | `frontend-vue/src/projects/components`, `frontend-vue/src/projects/views/*/components` | component locations and current reusable components |
| Frontend views/store | `NewSystemRegistry.vue`, `Status.vue`, `store/modules/Setting/index.js`, `store/modules/Accounts/index.js` | Vue 2/CoreUI/Vuex patterns |
| Test inventory | `backend-node/package.json`, `frontend-vue/package.json`, `tests/*` | available verification commands |

## T4 Current Behavior

- Current agents existed only under `docs/agents` and did not have a master AI workflow document.
- Root `AGENTS.md` only had backend route style rules.
- Repo has no previous `docs/AI-WORKFLOW.md`.
- PRD existed under `backend-node/docs/IAM_PRD.md`, but current source route truth is `backend-node/server/routes/app.routes.js`.
- Frontend has shared components under `src/projects/components` and domain components under `src/projects/views/<domain>/components`.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | owns workflow sequencing and T1-T20 handoff |
| Product Owner | yes | owns FR/AC and PRD update decision |
| Data Model | yes | owns schema/contract/migration sections |
| Backend | yes | owns backend style and tests |
| Frontend | yes | owns component-based frontend rules |
| Security IAM | yes | owns permission/security review |
| QA/UAT | yes | owns testing evidence and go/no-go |
| Release/Ops | yes | owns release/rollback gates |

## T6 Scope

In scope:

- add `docs/AI-WORKFLOW.md`
- add T1-T20 template
- add NewSystem PRD baseline
- update root `AGENTS.md`
- update role-based agents and sprint/orchestrator docs
- verify docs references and source alignment

Out of scope:

- application behavior changes
- backend/frontend code changes
- running full app tests for docs-only changes

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-NEW-001 | AI must read repo source before planning or editing | All agents | Must |
| FR-NEW-002 | AI must test/verify changes before declaring done | Implementer/QA agents | Must |
| FR-NEW-003 | Change docs must use T1-T20 format | All agents | Must |
| FR-NEW-004 | PRD must be updated when behavior or contract changes | PO/Orchestrator | Must |
| FR-NEW-005 | Development must follow existing repo patterns | Backend/Frontend agents | Must |
| FR-NEW-006 | Frontend work must be component-based | Frontend agent | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-NEW-001 | FR-NEW-001 | an agent receives work | before planning/editing | it must read relevant repo files and record source evidence |
| AC-NEW-002 | FR-NEW-002 | an implementation is changed | before final handoff | scoped tests or verification commands are recorded |
| AC-NEW-003 | FR-NEW-003 | a change doc/handoff is created | during delivery | sections T1-T20 are present |
| AC-NEW-004 | FR-NEW-004 | API/UI/data/permission behavior changes | before release | `docs/prd/PRD-NewSystem.md` is updated or documented as not needed |
| AC-NEW-005 | FR-NEW-005 | backend/frontend work starts | during implementation | local repo patterns are followed |
| AC-NEW-006 | FR-NEW-006 | frontend UI is added/expanded | during implementation | UI is split into page orchestration and components |

## T9 API Contract

No runtime API contract changed.

## T10 Data Model / Migration

| Item | Decision | Evidence |
|---|---|---|
| Schema change | no | docs-only change |
| Migration | no | docs-only change |
| Seed/backfill | no | docs-only change |
| Index | no | docs-only change |
| Rollback | revert docs files | no data impact |

## T11 Backend Plan / Changes

- No backend runtime files changed.
- Backend agent docs now require source reading, mounted route verification, backend style matching, tests, T1-T20, and PRD update decision.

## T12 Frontend Plan / Changes

- No frontend runtime files changed.
- Frontend agent docs now require Vue 2/CoreUI/Vuex/API wrapper alignment and component-based UI structure.
- Component locations documented:
  - `frontend-vue/src/projects/components`
  - `frontend-vue/src/projects/views/<domain>/components`

## T13 Security / Permission

| Concern | Decision / Evidence |
|---|---|
| Authentication | workflow requires protected route auth guard verification |
| Authorization path/action | workflow and agents require permission source evidence |
| Data scope | workflow requires target-account data scope decision |
| Audit | security agent owns audit review for sensitive changes |
| Input validation | backend agent requires service-level validation/sanitization |
| Error/secret leakage | security agent checklist retained |

## T14 Test Plan

| Test ID | Type | Role/User | Steps | Expected |
|---|---|---|---|---|
| TC-001 | docs verification | agent | check key referenced files exist | all key files return OK |
| TC-002 | stale-reference check | agent | grep for old IAM repo paths | no stale `IAM/backend-node` or `IAM/frontend-vue` paths in new workflow docs |
| TC-003 | workflow linkage | agent | grep for `AI-WORKFLOW`, `T1-T20`, `PRD-NewSystem` | links appear across workflow and agents |

## T15 Implementation Summary

| File | Change |
|---|---|
| `docs/AI-WORKFLOW.md` | added master workflow, rules, gates, repo style, T1-T20 |
| `docs/templates/T1-T20-change-document.md` | added reusable T1-T20 template |
| `docs/prd/PRD-NewSystem.md` | added source-aligned PRD baseline |
| `AGENTS.md` | pointed agents to workflow and added mandatory rules |
| `docs/agents/README.md` | linked workflow/PRD and global rules |
| `docs/agents/agent-00-orchestrator.md` | added workflow/PRD/T1-T20 source gates |
| `docs/agents/agent-01-product-owner.md` | added PRD/T1-T20 responsibility |
| `docs/agents/agent-02-data-model.md` | added workflow/PRD and source-verified data contract rules |
| `docs/agents/agent-03-backend.md` | added source/test/PRD/T1-T20 backend gates |
| `docs/agents/agent-04-frontend.md` | added component-based frontend rules |
| `docs/agents/agent-05-security-iam.md` | added workflow/PRD/T1-T20 review evidence |
| `docs/agents/agent-06-qa-uat.md` | added workflow/PRD/T1-T20 test evidence |
| `docs/agents/agent-07-release-ops.md` | added PRD/docs release sign-off |
| `docs/agents/sprint-task-template.md` | added workflow/PRD and T1-T20 task |
| `docs/agents/orchestrator-example.md` | added workflow/PRD and T1-T20 handoff task |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `for f in docs/AI-WORKFLOW.md ... frontend-vue/src/service/api.js; do test -f "$f"; done` | pass | all key references, including this change document, returned `OK` |
| `grep -RIn "IAM/backend-node\\|IAM/frontend-vue\\|docs/prd/PRD-IAM\\|IAM Agent Operating" ...` | pass | no stale old-repo paths found |
| `grep -RIn "T1-T20\\|PRD-NewSystem\\|AI-WORKFLOW" ... \| wc -l` | pass | 67 workflow/PRD/T1-T20 references found |
| `find docs -maxdepth 3 -type f` | pass | new docs listed under `docs/AI-WORKFLOW.md`, `docs/prd`, `docs/templates`, `docs/agents` |

Commands not run:

| Command | Reason | Risk |
|---|---|---|
| `npm test`, `npm run test:unit`, app smoke tests | docs-only change; no runtime code changed | low, limited to documentation consistency |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-NewSystem.md` | yes | created baseline product PRD and PRD update rules |
| `docs/AI-WORKFLOW.md` | yes | created master workflow |
| `docs/templates/T1-T20-change-document.md` | yes | created required change document template |
| `docs/agents/*` | yes | aligned agents with workflow and repo style |
| `AGENTS.md` | yes | linked root instruction to workflow |

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| D-001 | Decision | `docs/AI-WORKFLOW.md` is the primary workflow; role files are subordinate | Orchestrator | closed |
| D-002 | Decision | `docs/prd/PRD-NewSystem.md` is the active PRD baseline; older backend PRD is historical/reference | Product Owner | closed |
| D-003 | Decision | Frontend new work must be component-based even where legacy pages are monolithic | Frontend | closed |
| R-001 | Risk | Future agents may skip tests if environment fails | QA/UAT | open |
| A-001 | Assumption | Docs-only changes do not require full application test suite | Orchestrator | closed |

## T19 Release / Rollback

- Release steps: docs only; no deploy required unless documentation site is published.
- Smoke checks: not applicable.
- Monitoring: not applicable.
- Rollback trigger: workflow docs are rejected or found inconsistent.
- Rollback steps: revert the docs files listed in T15.

## T20 Final Handoff

```txt
Feature: AI-WORKFLOW and agent operating model
Status: Done
Changed files: docs/AI-WORKFLOW.md, docs/templates/T1-T20-change-document.md, docs/prd/PRD-NewSystem.md, AGENTS.md, docs/agents/*
Routes: no runtime route changes
UI routes: no runtime UI changes
Permission: no runtime permission changes
Data migration: no
Tests run: docs reference checks and stale-reference grep
PRD/docs: updated
Security decision: not required for docs-only change
QA decision: docs verification passed
Release decision: no deploy required
Open risks: future agents must enforce test gate when runtime code changes
Next owner: Orchestrator for future AI-assisted work
```
