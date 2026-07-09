# MFU SHUTTLE BUS AI Base Passenger Counting And Analysis In Campus Bus Stop Tasklist And Progress Tracking

This directory stores active execution tasklists for `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis` work. A tasklist is required for every feature, fix, docs/process change, readiness review, and release workflow.

## Storage

Use one active tasklist per feature/change/sprint:

```txt
docs/tasks/2026-06-18-<topic>.md
```

Use one canonical system readiness/progress file:

```txt
docs/tasks/tasklist-progress.md
docs/tasks/tasklist-progress.html
```

Update `docs/tasks/tasklist-progress.md` every time system progress changes, then regenerate `docs/tasks/tasklist-progress.html`. Do not create a new dated system-progress file for each update.

Feature/change/sprint-specific tasklists may still use dated files when they are useful, but their current status must be reflected in `docs/tasks/tasklist-progress.md`.

After handoff, dated tasklists should be moved to:

```txt
docs/tasks/archive/
```

Completed or handed-off work must also have a T1-T20 change record:

```txt
docs/changes/2026-06-18-<topic>.md
```

## Required Columns

| Column | Required content |
|---|---|
| Task ID | stable ID such as `mfu-shuttle-bus-ai-base-passenger-counting-and-analysis-TASK-001` |
| Task | concise work item |
| Agent | responsible role |
| Owner | person/team/agent owner |
| Depends On | prerequisite task IDs |
| Status | approved status value |
| Progress % | evidence-based numeric progress |
| Progress Basis | completed gate(s), not a guess |
| Source Evidence | repo files/routes/tests/docs read |
| Tests Evidence | commands/smoke/verification result or not-run reason |
| Blocker | blocker ID or `none` |
| Next Action | concrete next step |
| Output | expected or produced artifact |

## Status Values

- `pending`
- `discovery`
- `ready`
- `in_progress`
- `verifying`
- `docs_prd`
- `blocked`
- `done`

## Progress Gates

Progress must be calculated from gates:

| Gate | Weight | Required evidence |
|---|---:|---|
| Discovery evidence | 20% | source evidence recorded in T1-T4 |
| Implementation or docs change | 30% | files changed or doc/process update drafted |
| Tests / smoke / verification evidence | 30% | T16 command results or docs-only verification |
| PRD / docs decision | 10% | T17 PRD/doc update or reason not needed |
| T1-T20 handoff | 10% | T20 final handoff with open items |

Rules:

- Do not use guessed percentages.
- Do not set `Progress %` to `100` or `Status` to `done` without T16 verification evidence and T20 handoff.
- Docs-only tasks may use docs verification instead of app tests.
- Profile/account UI or other personal-data changes must record visible fields, hidden sensitive fields, stored/changed data, and PDPA/data-minimization decision in the tasklist and T1-T20 handoff.
- If verification cannot run, keep progress below `100`, set a blocker or next action, and record command, reason, risk, owner, and next action.
- Update the tasklist when source discovery completes, implementation starts, implementation finishes, verification starts, verification finishes, PRD/docs are updated, a blocker appears, or handoff is complete.
- For system progress updates, always update `docs/tasks/tasklist-progress.md` and regenerate `docs/tasks/tasklist-progress.html`; keep dated tasklists as historical work records only.
- During development or bug fixing, update `docs/tasks/tasklist-progress.md` as soon as status moves to `discovery`, `in_progress`, `verifying`, `blocked`, `docs_prd`, or `done`.

Regenerate the HTML view after changing progress:

```sh
node scripts/render-tasklist-progress-html.js .
```

## Progress Report Format

`docs/tasks/tasklist-progress.md` is the editable source. `docs/tasks/tasklist-progress.html` is the generated report view.

The generated report must keep this structure:

| Area | Report behavior |
|---|---|
| Summary | Field/Value table appears before Task Board. |
| Task Board | T1-T5 data appears in board tabs. |
| T3 tab | Active task rows appear with task status filters. |
| T5 tab | Blocker and risk register appears separately from task filters. |
| Lower content | Starts after T1-T5, normally at T6, to avoid duplicate report sections. |

## Template

Use `docs/templates/PROJECT-TASKLIST-TEMPLATE.md` for feature/change tasklists when present.
Use `docs/templates/PROJECT-SYSTEM-PROGRESS-TEMPLATE.md` for system readiness when present.
