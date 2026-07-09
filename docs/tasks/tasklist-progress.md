# Tasklist: MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop System Progress And Readiness

| Field | Value |
|---|---|
| Date | 2026-07-08 |
| Project | MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop |
| Module / Feature | system progress and readiness |
| Requirement | Track actual project system progress from source and verification evidence |
| Active Change Record | `docs/changes/2026-07-08-project-folder-restructure.md` |
| Overall Status | docs_prd |
| Overall Progress | 45% |
| Progress Type | Evidence-backed readiness score, not final product completion |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| API mount points | `backend-node/app.js` |
| Backend scripts | `backend-node/package.json` |
| Frontend routes | `frontend-vue/src/router/index.js` |
| Frontend API client | `frontend-vue/src/service/api.js` |
| Docs control | `docs/AI-WORKFLOW.md`, `docs/AI-DOCS-INDEX.md`, `docs/tasks/README.md`, `docs/templates/T1-T20-change-document.md` |
| Module docs | `docs/modules/*` when present |
| Environment config | static key check only; do not document secret values |

## T2. Progress Calculation

Adjust weights per project, but keep them evidence-backed.

| Readiness Area | Weight | Earned | Basis |
|---|---:|---:|---|
| Backend API/services verified | 35 | 10 | Source path, package scripts, and syntax checks passed; runtime smoke still pending env/database. |
| Integration/auth verified | 15 | 0 | Not verified yet. |
| Frontend route/API mapped | 20 | 20 | Frontend folder renamed, API helper moved to `frontend-vue/src/service/api.js`, and frontend build passed. |
| Environment/static config checked | 10 | 0 | Not verified yet. |
| Release verification | 15 | 0 | Not verified yet. |
| Tasklist and handoff | 5 | 5 | Active tasklist and change record created for folder restructure. |
| **Total** | **100** | **50** | Folder restructure is complete; broader backend/release readiness still needs env-backed verification. |

## T3. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-001 | Map API surface | Orchestrator | AI | none | pending | 0 | not started | | | none | read route truth | source map |
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-002 | Verify backend readiness | Backend | AI | mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-001 | pending | 0 | not started | | | none | run backend tests | backend readiness evidence |
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-003 | Verify frontend readiness | Frontend | AI | mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-001 | pending | 0 | not started | | | none | run frontend verification | frontend readiness evidence |
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-004 | Verify release readiness | Release/Ops | AI | mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-002,mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-SYS-003 | pending | 0 | not started | | | none | run smoke/e2e | release readiness evidence |
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-FOLDER-001 | Align project folder structure with docs | Orchestrator | AI | none | done | 100 | discovery, implementation, verification, docs update, and handoff complete | `docs/AI-WORKFLOW.md`, `README.md`, `backend-node/app.js`, `frontend-vue/src/router/index.js`, `frontend-vue/src/service/api.js` | backend `node -c` checks passed; `npm run build` in `frontend-vue` passed; `node scripts/render-tasklist-progress-html.js .` passed | none | none | renamed folders and updated docs |

## T4. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| backend syntax check | pass | `node -c app.js`; `node -c models/*.js` in `backend-node` |
| backend runtime smoke | not run | Requires configured `backend-node/.env` and MongoDB. |
| frontend lint/test/build | pass | `npm run build` in `frontend-vue` |
| live smoke/e2e | not run | |
| docs progress render | pass | `node scripts/render-tasklist-progress-html.js .` |

## T5. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| B-001 | blocker | closed | No active blocker for folder restructure. | none | none |
| R-001 | risk | open | Backend has no test script and requires configured env/database for runtime smoke. | Backend readiness cannot be fully verified from scripts alone. | Run backend start/smoke with real env when available. |

## T6. Decision

Project folder restructure is complete. Source folders now use `backend-node/` and `frontend-vue/`; backend runtime and release readiness still need environment-backed verification.
