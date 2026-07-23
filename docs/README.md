# Documentation Index

This folder contains two kinds of documentation:

1. Current system handover documentation for teams taking over development.
2. AI development workflow, task history, templates, and historical records.

When documentation conflicts with source code, treat the current source code as the source of truth and update the documentation.

## Current System Handover

Start here when onboarding a new development team.

| Document | Purpose |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | High-level system structure and main runtime flow. |
| [Setup](handover/SETUP.md) | Local development setup for backend, frontend, AI, and Docker. |
| [Environment](handover/ENVIRONMENT.md) | Environment variables and secret handling. |
| [API](handover/API.md) | REST endpoints and Socket.IO events from the current backend. |
| [Database](handover/DATABASE.md) | MongoDB collections, Mongoose models, and data ownership notes. |
| [Authorization](handover/AUTHORIZATION.md) | JWT, roles, backend middleware, and frontend route guards. |
| [AI Livefeed](handover/AI-LIVEFEED.md) | Camera, RTSP, YOLO detector, stream proxy, and detection flow. |
| [Deployment](handover/DEPLOYMENT.md) | Docker Compose services, deployment, backup, restore, rollback. |
| [Testing](handover/TESTING.md) | Smoke checks, manual UAT areas, and recommended future tests. |
| [Troubleshooting](handover/TROUBLESHOOTING.md) | Common runtime problems and fixes. |
| [Handover Checklist](handover/HANDOVER-CHECKLIST.md) | Final checklist before transferring ownership. |

## Product Requirements

| Location | Status |
| --- | --- |
| [prd/](prd/) | Product requirement records. Verify against source before treating as current behavior. |

## AI Workflow and Historical Records

These documents are useful for understanding how the project has been developed and controlled, but they are not all current runtime documentation.

| Location | Purpose |
| --- | --- |
| [AI-DOCS-INDEX.md](AI-DOCS-INDEX.md) | Existing AI documentation index and process-oriented source of truth rules. |
| [AI-WORKFLOW.md](AI-WORKFLOW.md) | AI/agent workflow, gates, evidence requirements, and T1-T20 process. |
| [agents/](agents/) | Role definitions for AI agents. |
| [tasks/](tasks/) | Task progress records and generated progress dashboard. |
| [changes/](changes/) | Change records and handoff notes for previous work. |
| [templates/](templates/) | Templates for future tasklists, progress dashboards, and change records. |
| [IAM-UPGRADE.md](IAM-UPGRADE.md) | IAM upgrade notes. Some paths may refer to older or external structures. |
| [BOOTSTRAP-CHECKLIST.md](BOOTSTRAP-CHECKLIST.md) | Bootstrap checklist. Treat as process guidance, not current runtime setup. |

## Maintenance Rules

- Keep `README.md` short and link to detailed docs instead of duplicating them.
- Update `docs/handover/*` when current runtime behavior changes.
- Keep historical task/change records intact unless a correction is explicitly needed.
- Mark stale or external-process documents clearly rather than mixing them into current handover docs.
