# MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop AI Documentation Index

This docs set controls AI-assisted delivery for `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis`. Keep it aligned with source code, tests, and release evidence.

## Core Control Docs

These files are required for generated projects because the workflow uses them during real work:

| Document | Purpose | Required |
|---|---|---|
| `docs/AI-WORKFLOW.md` | Main source-first workflow, gates, evidence rules, test rules, PRD/docs decisions, and handoff rules. | yes |
| `docs/AI-DOCS-INDEX.md` | Inventory of active docs and control docs. | yes |
| `docs/tasks/README.md` | Tasklist storage, required columns, progress gates, and update rules. | yes |
| `docs/tasks/tasklist-progress.md` | Current system readiness/progress dashboard from source and verification evidence. Update this same file every time system progress changes. | yes |
| `docs/tasks/tasklist-progress.html` | Generated HTML view of `tasklist-progress.md` for quick review. Regenerate after progress changes. | yes |
| `docs/tasks/2026-06-18-<topic>.md` | Active tasklist for each feature, fix, docs/process change, readiness review, or release workflow. | yes, per task |
| `docs/changes/2026-06-18-<topic>.md` | T1-T20 change record and final handoff for completed or handed-off work. | yes, per task |
| `docs/templates/T1-T20-change-document.md` | Required change note and handoff template. | yes |
| `docs/prd/PRD-mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.md` | Product requirement truth, or replace with the actual PRD path used by this project. | yes |

## Optional Docs

Create these only when the project actually uses them:

| Document / Folder | Use when |
|---|---|
| `docs/agents/*` | The project needs role-specific agent instructions beyond `AI-WORKFLOW.md`. |
| `docs/modules/*` | A module has stable APIs, UI behavior, permissions, or operations that need source-aligned documentation. |
| `docs/runbooks/*` | The project has repeated operational procedures such as migration, deployment, bootstrap, smoke, or rollback. |
| `docs/contracts/*` | The project exposes or consumes integration contracts. |
| `docs/compliance/*` or `docs/risk/*` | The project displays, stores, exports, or changes personal data and needs PDPA/privacy/security decisions tracked from source evidence. |
| `docs/defect/*` or `docs/issue/*` | Defect/issue records are needed for QA or stakeholder tracking. |

## Do Not Create By Default

Do not add these unless the project has a real need and source evidence:

- Enterprise T01-T20 document sets
- Infographics
- Historical source review summaries
- Additional HTML dashboards beyond `docs/tasks/tasklist-progress.html`
- Copied IAM-specific progress or evidence documents

## Active Tasklists

| Document | Status | Notes |
|---|---|---|
| `tasks/README.md` | active | Tasklist and progress control rules. |
| `tasks/tasklist-progress.md` | active | Canonical system readiness/progress tasklist updated in place. |
| `tasks/tasklist-progress.html` | active | Generated HTML view of the canonical progress tasklist. |
| `tasks/2026-06-18-<topic>.md` | active as needed | One focused tasklist per work item. |

## Change Records

| Document | Status | Notes |
|---|---|---|
| `changes/2026-06-18-<topic>.md` | active as needed | T1-T20 handoff for each completed or handed-off work item. |

## Rule

If a doc conflicts with mounted source code, imported source code, tests, or release scripts, source wins and the doc must be updated in the same change.
