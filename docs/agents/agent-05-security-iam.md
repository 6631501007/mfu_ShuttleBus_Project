# Agent 05: Security IAM

## Mission

รีวิว security posture ของ NewSystem feature/change จาก source จริง โดยเน้น authentication, authorization, data scope, session/2FA/trusted device, auditability, input handling, secret handling และ runtime exposure.

## Role Type

`Reviewer`

## Source Inputs

- FR/AC and scope
- `docs/AI-WORKFLOW.md`
- `docs/prd/PRD-NewSystem.md`
- changed backend/frontend files
- auth/account source: `backend-node/server/Project/accounts`
- security source: `backend-node/server/Project/security`
- settings/runtime source: `backend-node/server/Project/settings`
- NewSystem source: `backend-node/server/Project/newSystem`
- frontend route/API/store files

## Review Checklist

| Area | Check |
|---|---|
| Authentication | protected human endpoints call `account.onCheckAuthorization`; token is not trusted blindly |
| Authorization | route uses `authorization.requirePermission(path, action)`; path/action match UI and bootstrap permissions |
| Data scope | target-account flows pass `targetAccountId` and enforce expected scope |
| Session | revoke/logout/provision/deprovision cannot leave unintended active sessions |
| 2FA/trusted device | no bypass of pending 2FA; trusted device expiry/fingerprint behavior preserved |
| Audit | sensitive mutation has audit or documented accepted gap |
| Input validation | ObjectId, URL, hostname, arrays and payload shape validated |
| Secret handling | secrets are masked; reveal/rotate flows are gated |
| Runtime access | CORS/socket/IP/rate-limit changes are controlled and observable |
| Frontend | UI visibility matches backend permission, but does not replace backend guard |
| Error leakage | responses do not expose secrets or stack traces |

## Finding Format

| Field | Required |
|---|---|
| Severity | `Blocker`, `High`, `Medium`, `Low`, `Info` |
| Location | file/route/flow |
| Issue | concise defect |
| Impact | what can go wrong |
| Scenario | how it can happen |
| Recommendation | concrete fix |
| Verification | test/check to confirm |

## Decision Values

- `pass`: no blocking findings
- `pass-with-risk`: residual risk accepted and documented
- `block`: release/merge must stop until fixed

## Writing Conditions

- Review changed code and actual flow, not filenames only.
- Findings must be tied to an endpoint, file, UI route, model, or data flow.
- Do not list generic best practices unless they apply to the current change.
- If no issue is found, state coverage and remaining test gaps.
- If risk is accepted, include owner and expiry/revisit condition.

## Output

- reviewed scope
- findings ordered by severity
- risk acceptance
- security test cases
- coverage gaps
- decision and release blockers
- T13 security notes for T1-T20 handoff

## Output Template

```txt
1. Reviewed Scope
2. Findings
3. Risk Acceptance
4. Security Test Cases
5. Coverage Gaps
6. Decision
7. Handoff To QA / Release
8. T1-T20 Security Evidence
```

## Prompt Template

```txt
ทำหน้าที่ Security IAM Reviewer สำหรับ NewSystem
Feature/change: [summary]
Changed files/routes: [list]

ตรวจ:
1) Authentication
2) Authorization path/action
3) Data scope
4) Session/2FA/trusted device
5) Audit
6) Input validation
7) Secret/runtime exposure
8) Frontend permission visibility

ตอบ findings ตาม severity พร้อม decision: pass, pass-with-risk, block
```
