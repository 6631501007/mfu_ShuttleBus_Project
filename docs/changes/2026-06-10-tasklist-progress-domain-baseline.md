# Change Record: MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop Tasklist Progress Domain Baseline

| Field | Value |
|---|---|
| Date | 2026-06-10 |
| Project | MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop |
| Project code | `mfushuttlebusaibasepassengercountingandanalysis` |
| Change type | docs/process |
| Status | docs_prd |
| Related tasklist | `docs/tasks/tasklist-progress.md` |

## T1. Request

Create domain-separated tasklists and progress tracking for TimeAttendance, SuperApp, Financial, and SDK.

## T2. Source Discovery

Read README/PRD/design docs, backend route mounts, package scripts, frontend router/nav, and existing task docs for this domain.

## T3. Scope

Docs-only baseline update for `sdk/docs/tasks` and `sdk/docs/changes`.

## T4. Out Of Scope

No runtime source code changes, no backend test execution, no frontend build/lint/unit/e2e execution, no live smoke execution, and no secret/env value documentation.

## T5. Evidence

| Area | Evidence |
|---|---|
| Backend | `backend-node/server/routes/app.routes.js:9-12`, `backend-node/server/Project/mfushuttlebusaibasepassengercountingandanalysis/mfushuttlebusaibasepassengercountingandanalysis.routes.js:31-81`, `backend-node/server/Project/accounts/accounts.routes.js:29-161`; `backend-node/package.json` |
| Frontend | `frontend-vue/src/router/index.js:31-151`, `frontend-vue/src/containers/_nav.js:14-125`; `frontend-vue/package.json` |
| Docs | `README.md`, `ENVIRONMENTS.md`, `DEPLOY-UBUNTU.md`; `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md`; `docs/tasks/README.md` |

## T6. Docs Updated

| File | Purpose |
|---|---|
| `docs/tasks/README.md` | Domain tasklist standard and source map. |
| `docs/tasks/tasklist-progress.md` | Current evidence-backed progress. |
| `docs/tasks/tasklist-progress.html` | Rendered progress board. |
| `docs/changes/2026-06-10-tasklist-progress-domain-baseline.md` | This T1-T20 handoff record. |

## T7. Progress Decision

Overall progress is 50% because source/docs discovery is complete and docs are updated, while backend/frontend/live verification remains pending.

## T8. Verification

| Command | Result |
|---|---|
| `node scripts/render-tasklist-progress-html.js sdk` | pass |
| `node scripts/check-tasklist-progress-standard.js sdk` | pass |

## T9. Blockers

- B-SDK-001: Backend/frontend/live smoke tests were not run in this docs-only pass. Next action: Run backend `npm run test:all`, frontend `npm run verify`, and live smoke with configured env.
- R-SDK-001: Repository has many pre-existing modified/deleted/untracked files outside this docs scope. Next action: Review only files touched by this task before commit.

## T10. Rollback

Revert only the docs files listed in T6 if this baseline must be removed. Do not revert unrelated workspace changes.

## T11. Owner

AI created the docs baseline. Domain owner must run and record runtime verification.

## T12. Security

No secrets were copied into docs. Environment files were treated as static presence evidence only.

## T13. Compatibility

No runtime behavior changed.

## T14. Data / Migration

No data schema or migration changed.

## T15. Release

Not release-ready from this docs pass alone.

## T16. Test Evidence

Docs render/check passed. Backend/frontend/live verification not run.

## T17. PRD / Docs Decision

No PRD behavior change was made. Financial has a recorded source/PRD mismatch requiring follow-up.

## T18. Open Items

Run backend tests, frontend verification, IAM bootstrap, and live smoke per `docs/tasks/tasklist-progress.md`.

## T19. Review Notes

The repository had extensive pre-existing dirty/untracked state before this docs update. Review this change by the files listed in T6.

## T20. Handoff

Domain tasklist and progress baseline are ready for review. Runtime readiness evidence must be added in the next verification pass.
