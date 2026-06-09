# PRD: NewSystem

## Document Control

| Field | Value |
|---|---|
| Product | NewSystem |
| Version | 0.1 |
| Status | Baseline From Current Repo |
| Source checked date | 2026-05-28 |
| Related workflow | `docs/AI-WORKFLOW.md` |
| Related agents | `docs/agents/README.md` |

## Source Truth

This PRD must stay aligned with current source. If source and PRD conflict, source wins until PRD is updated.

| Area | Source |
|---|---|
| Backend mounted routes | `backend-node/server/routes/app.routes.js` |
| Backend module routes | `backend-node/server/Project/*/*.routes.js` |
| Frontend routes | `frontend-vue/src/router/index.js` |
| Frontend API wrapper | `frontend-vue/src/service/api.js` |
| Test commands | `backend-node/package.json`, `frontend-vue/package.json` |

## Product Overview

NewSystem is an IAM-integrated agreement management system for MFU. It provides:

- NewSystem document registry
- IAM delegated authentication and permission filtering
- account directory and lifecycle surfaces
- security permission management
- settings, runtime access, backup, email, and HR/reference data management
- Vue frontend and Node.js backend delivery through Docker/GitLab pipeline

## Current Mounted Backend Routes

| Mount | Route file | Notes |
|---|---|---|
| `/api/v1/newSystem` | `backend-node/server/Project/newSystem/newSystem.routes.js` | document registry API |
| `/api/v1/setting` | `backend-node/server/Project/settings/settings.routes.js` | settings/runtime/backup/email/HR/reference APIs |
| `/api/v1/security` | `backend-node/server/Project/security/security.routes.js` | security/RBAC/audit proxy APIs |
| `/api/v1` | `backend-node/server/Project/accounts/accounts.routes.js` | sign-in, auth/session, account APIs |

Known compatibility note:

- `frontend-vue/src/service/api.js` currently calls document endpoints with lowercase `/api/v1/newsystem/...`.
- Backend route mount is `/api/v1/newSystem`.
- Any change touching this area must verify runtime compatibility before changing casing.

## Current Frontend Route Domains

| UI route | Permission | View |
|---|---|---|
| `/dashboard` | `/dashboard:view` | `src/views/Dashboard` |
| `/newSystem/registry` | `/newsystem/registry:view` | `projects/views/newSystem/NewSystemRegistry` |
| `/operations/business` | `/operations/business:view` | `projects/views/operations/BusinessOperations` |
| `/accounts/directory` | `/accounts/directory:view` | `projects/views/accounts/Management` |
| `/security/permissions/menu` | `/security/permissions/menu:view` | `projects/views/security/CreateMenu` |
| `/security/permissions/group` | `/security/permissions/group:view` | `projects/views/security/CreateGroup` |
| `/security/permissions/matrix` | `/security/permissions/matrix:view` | `projects/views/security/PermissionMatrix` |
| `/security/audit` | `/security/audit:view` | `projects/views/security/AuditExplorer` |
| `/config/*`, `/setting/*` | matching config/setting permission | `projects/views/setting/*` |

## Functional Areas

### FR-NEW-001 Authentication And Session

Users can sign in, bootstrap session through `/auth/me`, manage sessions, use 2FA, and manage trusted devices.

Source:

- `backend-node/server/Project/accounts/accounts.routes.js`
- `frontend-vue/src/store/modules/Authen/index.js`
- `frontend-vue/src/views/pages/Login.vue`

### FR-NEW-002 Account Directory And Lifecycle

Authorized users can list accounts, invite/update accounts, manage status, lifecycle, sessions, trusted devices, and effective permissions.

Source:

- `backend-node/server/Project/accounts/accounts.routes.js`
- `frontend-vue/src/store/modules/Accounts/index.js`
- `frontend-vue/src/projects/views/accounts`

### FR-NEW-003 NewSystem Document Registry

Authorized users can list, create, update, delete, seed demo, and view stats for NewSystem documents.

Source:

- `backend-node/server/Project/newSystem/newSystem.routes.js`
- `backend-node/server/Project/newSystem/service/newSystem_document.js`
- `backend-node/server/Project/newSystem/models/newSystem_document.model.js`
- `frontend-vue/src/projects/views/newSystem/NewSystemRegistry.vue`

Current API contract:

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/v1/newSystem/documents` | `/newsystem/registry:view` |
| GET | `/api/v1/newSystem/documents/stats` | `/newsystem/registry:view` or `/newsystem/reports:view` |
| POST | `/api/v1/newSystem/documents` | `/newsystem/registry:edit` |
| PUT | `/api/v1/newSystem/documents/:id` | `/newsystem/registry:edit` |
| DELETE | `/api/v1/newSystem/documents/:id` | `/newsystem/registry:delete` |
| POST | `/api/v1/newSystem/documents/seed-demo` | `/newsystem/registry:edit` |

### FR-NEW-004 Security And Permission Management

Authorized users can manage security types, menus, groups, permission matrix, assignments, and audit events through IAM admin proxy routes.

Source:

- `backend-node/server/Project/security/security.routes.js`
- `frontend-vue/src/store/modules/Security`
- `frontend-vue/src/projects/views/security`

### FR-NEW-005 Settings And Operations

Authorized users can manage setting messages, auth messages, status, groups, verification, email notifications/workflows, runtime access, database backup, lifecycle, HR, and reference data.

Source:

- `backend-node/server/Project/settings/settings.routes.js`
- `frontend-vue/src/store/modules/Setting/index.js`
- `frontend-vue/src/projects/views/setting`

## Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | protected routes require authentication and permission middleware |
| Maintainability | follow repo style before introducing new abstractions |
| Frontend structure | new UI work must be component-based |
| Compatibility | preserve existing API/response shape unless FR explicitly changes it |
| Testing | implementation must run scoped tests before handoff |
| Documentation | changes must produce T1-T20 handoff and PRD update decision |

## PRD Update Rules

Update this PRD when any change affects:

- FR/AC
- API endpoint, request, response, error behavior
- frontend route, page behavior, component workflow
- schema, migration, seed, index, rollback
- permission path/action/data scope
- test or release expectation

Use `docs/AI-WORKFLOW.md` section `T1-T20` for change documentation.
