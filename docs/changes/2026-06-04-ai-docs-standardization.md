# T1-T20: MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop AI Docs Standardization - 2026-06-04

## T1 Change Title

MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop AI workflow documentation standardization.

## T2 Requirement

Move the shared `doc-ai` operating docs into each project docs set so future development follows source-first discovery, testing gates, IAM/security review, and T1-T20 handoff rules.

## T3 Source Evidence

- `/doc-ai/AI-WORKFLOW.md`
- `/doc-ai/BOOTSTRAP-CHECKLIST.md`
- `/doc-ai/IAM-UPGRADE.md`
- `/doc-ai/agents/*`
- `/doc-ai/templates/T1-T20-change-document.md`
- `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/backend-node/server/routes/app.routes.js`
- `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/backend-node/package.json`
- `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/frontend-vue/package.json`
- `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/README.md`, `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/ENVIRONMENTS.md` when present

## T4 Assumptions And Open Questions

- Assumption: docs-only standardization does not require application rebuild or deploy.
- Open question: project teams should expand `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md` with detailed business-specific acceptance criteria as future source-backed changes are made.

## T5 Scope

- Add or refresh AI workflow docs under `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/docs`.
- Add source-aligned PRD baseline under `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/docs/prd`.
- Add required T1-T20 change template under `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/docs/templates`.

## T6 Out Of Scope

- No backend behavior change.
- No frontend behavior change.
- No environment/deployment change.

## T7 Impacted Modules

- Documentation only.

## T8 Data Model Impact

No data model impact.

## T9 API Impact

No API impact.

## T10 Permission Impact

No runtime permission impact. Docs now require permission path/action/data scope evidence for future changes.

## T11 Frontend Impact

No runtime frontend impact. Docs now require component-based UI changes and source-backed permission visibility checks.

## T12 Backend Impact

No runtime backend impact. Docs now require mounted-route verification before backend work.

## T13 Security / IAM Impact

No runtime security change. Docs now require IAM/security review for auth, account, permission, audit, session, and secret-related changes.

## T14 Release / Ops Impact

No deploy required for docs-only change.

## T15 Implementation Summary

Generated standardized docs from `doc-ai` with project-specific name, project code, PRD path, domain, package names, route evidence, and source area inventory.

## T16 Tests / Verification

- Verified generated docs contain no stale source-template references.
- Verified each project has `docs/AI-WORKFLOW.md`, `docs/agents/README.md`, `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md`, and `docs/templates/T1-T20-change-document.md`.
- App tests not run because this is docs-only and does not change runtime code.

## T17 PRD / Docs Update

Created or refreshed `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md` as the source-aligned PRD baseline.

## T18 Risks

- PRD content is intentionally baseline-level. Detailed FR/AC must be expanded only after reading source for each future business change.

## T19 Rollback

Remove or revert the generated docs under `MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop/docs` if the project should not use the shared AI workflow.

## T20 Final Handoff

MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop now has the shared AI workflow docs adapted for this project. Future work must read source first, run scoped verification, and update PRD/T1-T20 docs when behavior changes.
