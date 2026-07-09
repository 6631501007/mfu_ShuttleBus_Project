# AI-WORKFLOW: MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop

อัปเดตจาก source repo `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis` ณ วันที่ 2026-06-18

เอกสารนี้เป็น workflow หลักสำหรับ AI/agents ทุกตัวใน repo นี้. `docs/agents/*` คือ role instructions ส่วน `AI-WORKFLOW.md` คือ sequence, gates, evidence, test, PRD และเอกสารส่งมอบที่ทุก role ต้องทำตาม.

## 1. Operating Principle

AI ห้ามคาดเดา. ทุก requirement, route, field, permission, UI behavior, test command และ release step ต้องมาจาก source ใน repo หรือถูกบันทึกเป็น `Open Question`, `Assumption`, หรือ `Blocker` พร้อม owner.

## 2. Mandatory Rules

1. ห้ามคาดเดา ต้องอ่านข้อมูลจาก repo ก่อนเสมอ และต้องระบุ source evidence ใน output.
2. เมื่อมีการพัฒนาหรือปรับปรุง ต้องทดสอบการทำงานก่อนสรุปว่างานเสร็จ.
3. เอกสารการปรับปรุง, change note, handoff หรือ doc ใหม่ต้องใช้รูปแบบ `T1-T20`.
4. เมื่อมีการเปลี่ยนแปลง behavior, requirement, API, UI, permission, data model หรือ release impact ต้องปรับปรุง PRD ที่เกี่ยวข้อง.
5. การเปลี่ยนแปลงหน้า profile/account หรือ UI ที่แสดงข้อมูลส่วนบุคคลต้องบันทึก visible fields, hidden sensitive fields, stored/changed data และ PDPA/data-minimization decision ก่อน release.
6. การพัฒนาต้องเขียนตามรูปแบบเดิมของ repo ก่อนเสมอ ทั้ง backend และ frontend.
7. Frontend ต้องเขียนเป็น component-based structure: page ทำหน้าที่ orchestration, UI ย่อยแยกเป็น components.
8. ทุก task ต้องมี active tasklist ใน `docs/tasks/` และต้องอัปเดต `status`, `progress_percent`, evidence, blocker และ next action ทุกครั้งที่เปลี่ยน gate หรือสถานะ.
9. System progress ต้องอัปเดตไฟล์เดิม `docs/tasks/tasklist-progress.md` เสมอ ห้ามสร้าง root dated `*-system-progress.md` ไฟล์ใหม่.

## 3. Source Truth Order

ใช้ลำดับนี้เมื่อตรวจสอบความจริงของระบบ:

| Priority | Source | Purpose |
|---|---|---|
| 1 | Source code ที่ mounted/ถูก import จริง | behavior truth |
| 2 | Tests และ smoke scripts | expected behavior and regression coverage |
| 3 | `docs/prd/PRD-mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.md` | product requirement truth |
| 4 | `docs/agents/*` | role operating instructions |
| 5 | `README.md`, `ENVIRONMENTS.md`, `DEPLOY-UBUNTU.md` | environment and delivery notes |
| 6 | older docs | historical/reference only unless reconciled with source |

Route truth:

- Backend mounted route truth: `backend-node/app.js`
- Backend route implementation: `backend-node/app.js route handlers`
- Frontend route truth: `frontend-vue/src/router/index.js`
- Frontend API wrapper: `frontend-vue/src/service/api.js`

Execution truth:

- System progress truth: `docs/tasks/tasklist-progress.md`
- Feature/change tasklist truth: `docs/tasks/2026-06-18-<topic>.md`
- Docs control index: `docs/AI-DOCS-INDEX.md`
- Tasklist operating guide: `docs/tasks/README.md`
- Sprint/task template: `docs/agents/sprint-task-template.md`
- Final T1-T20 handoff/change record: `docs/changes/2026-06-18-<topic>.md`

## 4. Workflow And Agent Integration

```txt
Requirement
  -> T1-T4 Source Discovery
  -> Agent 00 Orchestrator
  -> Active Tasklist in docs/tasks
  -> Agent 01 Product Owner
  -> Agent 02 Data Model
  -> Agent 03 Backend + Agent 04 Frontend
  -> Tasklist progress update at every gate
  -> T15 Implementation Summary
  -> T16 Tests / Verification
  -> Agent 05 Security IAM
  -> Agent 06 QA/UAT
  -> Agent 07 Release/Ops
  -> T17 PRD / Docs Update
  -> T20 Final Handoff
```

Backend and Frontend may run in parallel only after:

- route/API contract is locked
- request/response shape is locked
- schema/migration decision is locked
- permission path/action/data scope is locked
- test data and role assumptions are documented

## 5. Required Source Discovery

Before implementation, the acting agent must read and record the relevant files.

Backend change minimum:

- `backend-node/app.js`
- target `*.routes.js` or equivalent mounted route file
- target service files
- target controller files when applicable
- target model/schema files when applicable
- privacy/PDPA impact when endpoint reads or writes personal data
- relevant tests and package scripts

Frontend change minimum:

- `frontend-vue/src/router/index.js`
- `frontend-vue/src/service/api.js`
- target page/view file
- relevant components under target domain components directory
- relevant store/state module
- visible fields and hidden sensitive fields when the UI displays profile/account or other personal data
- relevant tests and package scripts

Docs/process change minimum:

- `AGENTS.md` when present; if missing, record it as source evidence instead of guessing
- `docs/AI-WORKFLOW.md`
- `docs/agents/README.md`
- `docs/tasks/README.md`
- relevant role file under `docs/agents`
- relevant PRD or template
- relevant privacy, compliance, security, or risk document when personal data behavior changes

## 5.1 Tasklist And Progress Tracking

Every feature, fix, docs/process change, readiness review, or release workflow must create or update one active tasklist before implementation starts.

Every feature, fix, docs/process change, readiness review, or release workflow must also update `docs/tasks/tasklist-progress.md` when it affects system readiness, release readiness, verification state, blockers, or deploy state. After changing that Markdown source, regenerate `docs/tasks/tasklist-progress.html`.

Tasklist location:

```txt
docs/tasks/2026-06-18-<topic>.md
```

Tasklist files are active execution records. Completed or handed-off changes must also create or update a T1-T20 change record under:

```txt
docs/changes/2026-06-18-<topic>.md
```

Required tasklist columns:

| Column | Required content |
|---|---|
| Task ID | stable ID such as `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-TASK-001` |
| Task | concise work item |
| Agent | responsible role |
| Owner | person/team/agent owner |
| Depends On | prerequisite task IDs |
| Status | one of the approved status values |
| Progress % | evidence-based numeric progress |
| Progress Basis | gate(s) completed, not a guess |
| Source Evidence | repo files/routes/tests/docs read |
| Tests Evidence | commands/smoke/verification result, or not-run reason |
| Blocker | blocker ID or `none` |
| Next Action | concrete next step |
| Output | expected or produced artifact |

Approved task statuses:

- `pending`
- `discovery`
- `ready`
- `in_progress`
- `verifying`
- `docs_prd`
- `blocked`
- `done`

Progress is calculated from gates, not estimates:

| Gate | Weight | Minimum evidence |
|---|---:|---|
| Discovery evidence | 20% | T1-T4 source evidence recorded |
| Implementation or docs change | 30% | files changed or doc/process update drafted |
| Tests / smoke / verification evidence | 30% | T16 command results or docs-only verification |
| PRD / docs decision | 10% | T17 PRD/doc update or reason not needed |
| T1-T20 handoff | 10% | T20 final handoff with open items |

Rules:

- Do not set `Progress %` to `100` or `Status` to `done` without T16 verification evidence, unless the task is docs-only and docs-only verification has passed.
- If a test cannot run, keep the task below `100%`, set `Status` to `blocked` or `docs_prd` as appropriate, and record command, reason, risk, owner, and next action.
- Update the tasklist when source discovery completes, implementation starts, implementation finishes, verification starts, verification finishes, PRD/docs are updated, a blocker appears, or handoff is complete.
- Update `docs/tasks/tasklist-progress.md` in place when status changes to `discovery`, `in_progress`, `verifying`, `blocked`, `docs_prd`, or `done`.
- Regenerate `docs/tasks/tasklist-progress.html` after changing `docs/tasks/tasklist-progress.md`.
- During development or bug fixing, status updates are allowed and required as soon as evidence changes; do not wait for final handoff.
- If task progress is unknown, write `0` or the last evidence-backed percentage and record the uncertainty as an `Open Question`, `Assumption`, or `Blocker`.

## 5.2 Docs Control Set

New generated projects must include only the docs controls that are used by this workflow.

Required docs control files:

| File | Purpose |
|---|---|
| `docs/AI-WORKFLOW.md` | Main source-first workflow and delivery gates. |
| `docs/AI-DOCS-INDEX.md` | Inventory of active docs and control docs. |
| `docs/tasks/README.md` | Tasklist columns, progress gates, statuses, and update rules. |
| `docs/tasks/tasklist-progress.md` | Canonical system readiness/progress dashboard from project source and verification evidence. Update this same file every time system progress changes. |
| `docs/tasks/2026-06-18-<topic>.md` | One active tasklist per feature, fix, docs/process change, readiness review, or release workflow. |
| `docs/changes/2026-06-18-<topic>.md` | T1-T20 change note and final handoff. |
| `docs/templates/T1-T20-change-document.md` | Required T1-T20 format. |
| `docs/prd/PRD-mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.md` | Product requirement truth, or replace with the actual project PRD path. |

Optional docs, create only when the project actually uses them:

- `docs/agents/*` for role-specific instructions beyond this workflow.
- `docs/modules/*` for stable module API/UI/permission/operation docs.
- `docs/runbooks/*` for repeated operation, migration, deploy, smoke, or rollback procedures.
- `docs/contracts/*` for integration contracts.
- `docs/defect/*` or `docs/issue/*` for QA/stakeholder tracking.

Do not create these by default:

- enterprise T01-T20 document sets
- infographics
- historical source review summaries
- additional HTML dashboards beyond `docs/tasks/tasklist-progress.html`
- copied IAM-specific progress, evidence, or handoff documents

When a new project is generated, replace placeholders and verify:

- no unresolved `MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop`, `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis`, route, package, or PRD placeholders remain in control docs
- active tasklist cites target project source paths, not IAM paths
- progress values come from target project verification, not copied values
- T1-T20 change record includes T16 verification and T20 handoff

## 6. Development Pattern

Follow the current repo style before adding abstractions. Record the actual backend, frontend, and testing patterns from source in the project-specific copy of this workflow.

Minimum project-specific sections to fill:

- Backend framework and route pattern
- Frontend framework and component pattern
- Permission path/action pattern
- API response envelope
- Test commands
- Build commands
- Release/smoke commands

## 7. Done Criteria

Work is not done until:

- active tasklist is updated with final status and evidence
- `docs/tasks/tasklist-progress.md` is updated when system/release readiness changed
- `docs/tasks/tasklist-progress.html` is regenerated from the Markdown source
- source evidence is cited
- implementation/doc changes are summarized
- scoped verification is run or blocked with reason
- PRD/docs decision is recorded
- T1-T20 change record is updated
- open risks/blockers have owner and next action
