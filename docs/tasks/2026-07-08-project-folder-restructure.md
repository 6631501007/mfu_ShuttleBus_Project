# Tasklist: Project Folder Restructure

| Field | Value |
|---|---|
| Date | 2026-07-08 |
| Project | MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop |
| Module / Feature | project folder structure |
| Requirement | Adjust project folders and docs references to match the docs control structure and current source |
| Active Change Record | `docs/changes/2026-07-08-project-folder-restructure.md` |
| Overall Status | done |
| Overall Progress | 100% |

## T1. Source Evidence

| Area | Source Evidence |
|---|---|
| Docs workflow | `docs/AI-WORKFLOW.md`, `docs/AI-DOCS-INDEX.md`, `docs/tasks/README.md` |
| Source layout | `backend-node/app.js`, `backend-node/models/*`, `frontend-vue/src/router/index.js`, `frontend-vue/src/service/api.js` |
| Package scripts | `backend-node/package.json`, `frontend-vue/package.json` |
| Existing project overview | `README.md`, `FINAL_YEAR_PROJECT_REPORT.md` |

## T2. Active Tasklist

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-FOLDER-001 | Rename source folders to docs-controlled names | Orchestrator | AI | none | done | 100 | discovery, implementation, verification, docs update, and handoff complete | `docs/AI-WORKFLOW.md`, `README.md`, `backend-node/package.json`, `frontend-vue/package.json` | `npm run build` in `frontend-vue` passed; `node scripts/render-tasklist-progress-html.js .` passed | none | none | `backend-node/`, `frontend-vue/`, updated docs |

## T3. Verification Log

| Command / Check | Result | Evidence |
|---|---|---|
| `node -c app.js` in `backend-node` | pass | Backend entrypoint syntax check passed. |
| `node -c models/*.js` in `backend-node` | pass | Backend model syntax checks passed. |
| `npm run build` in `frontend-vue` | pass | Vite production build completed. |
| `node scripts/render-tasklist-progress-html.js .` | pass | Regenerated `docs/tasks/tasklist-progress.html`. |
| Backend runtime smoke | not run | Requires configured `backend-node/.env` and MongoDB. |

## T4. Blockers And Risks

| ID | Type | Status | Evidence | Impact | Next Action |
|---|---|---|---|---|---|
| R-001 | risk | open | Backend has no test script and requires local env/database for runtime smoke. | Backend runtime verification remains manual. | Run backend start/smoke with real env when available. |

## T5. Decision

Keep the implemented backend shape in `backend-node/app.js` instead of inventing a `server/Project` module tree. Source truth wins over stale generated docs.
