# T1-T20 Change Document: MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop 2FA OTP Paste Support

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop-2FA-OTP-PASTE-20260605 |
| Module | MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop frontend 2FA dialog |
| Date | 2026-06-05 |
| Status | Tested and deployed on server; public DNS pending |

## T2 Requirement

- Allow users to paste a full 2FA OTP into the six separated OTP inputs.
- Support pasted email text that contains the verification code.
- Keep backend verification and security contract unchanged.

## T3 Source Evidence

| Source | Evidence |
|---|---|
| `frontend-vue/src/projects/components/dialog/TwoFA.vue` | Six single-character OTP inputs previously had no paste handler. |
| `frontend-vue/src/service/api.js` | 2FA verify endpoint remains `/api/v1/auth/2fa/verify`. |
| `frontend-vue/src/store/modules/Authen/index.js` | `auth/twofaSend` continues to submit the completed code. |

## T4 Current Behavior

- Pasting `123456` fills all OTP boxes.
- Pasting text such as `Your verification code is 123456.` extracts `123456`.
- Completed six-character paste submits through the existing 2FA flow.

## T5 Impacted Agents

| Agent | Required | Reason |
|---|---|---|
| Frontend | yes | 2FA dialog input behavior changed. |
| Security IAM | yes | Authentication UX changed without changing backend validation. |
| QA/UAT | yes | OTP paste regression must be checked. |
| Product Owner | yes | PRD auth UX requirement updated. |

## T6 Scope

- In scope: 2FA OTP dialog paste behavior and unit test.
- Out of scope: OTP generation, OTP expiry, 2FA backend API, trusted-device logic.

## T7 Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | The OTP input must accept pasted six-character codes. |
| FR-002 | The OTP input must extract a six-digit code from common email text. |
| FR-003 | Completed paste must submit through the existing verification action. |

## T8 Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | User copies `123456` | User pastes into any OTP input | All six boxes are filled. |
| AC-002 | User copies email text containing `123456` | User pastes into OTP input | `123456` is extracted and filled. |
| AC-003 | Six characters are available | Paste completes | Existing `twofaSend` flow is called with the code. |

## T9 API Contract

- No API path, payload, response, or status code changed.
- Only frontend input normalization changed.

## T10 Data Model / Migration

- No schema, migration, seed, or index change.

## T11 Backend Plan / Changes

- No backend code changed.

## T12 Frontend Plan / Changes

| File | Change |
|---|---|
| `frontend-vue/src/projects/components/dialog/TwoFA.vue` | Added OTP paste normalization and paste handler. |
| `frontend-vue/tests/unit/projects/components/dialog/TwoFA.spec.js` | Added paste normalization and completed paste submit tests. |

## T13 Security / Permission

- Backend OTP validation remains authoritative.
- The frontend does not bypass verification; it only fills the existing code input.

## T14 Test Plan

| Test | Result |
|---|---|
| Targeted eslint on changed files | pass |
| `npm run test:unit -- --runTestsByPath tests/unit/projects/components/dialog/TwoFA.spec.js` | pass, 2 tests |
| `npm run build:prod` | pass |

## T15 Implementation Summary

- Added `normalizeOtpCode` to parse direct OTP values and email text snippets.
- Added `onPasteOtp` to fill OTP boxes and submit completed codes.

## T16 Tests Run / Evidence

- Targeted unit tests passed.
- Production build passed.
- Deployed to server `192.168.17.25` on 2026-06-08.
- Post-deploy Docker health passed for `mfushuttlebusaibasepassengercountingandanalysis-backend-1`, `mfushuttlebusaibasepassengercountingandanalysis-frontend-1`, and `mfushuttlebusaibasepassengercountingandanalysis-redis-1`.
- Server localhost smoke passed: web returned `200`; unauthenticated `/api/v1/auth/me` returned `401`.
- Public DNS smoke pending: `https://mfu-shuttle-bus-ai-base-passenger-counting-and-analysis.mfu.ac.th/` did not resolve from the test client.
- Watchman recrawl warning appeared during tests; it did not fail tests.

## T17 PRD / Docs Updated

- `docs/prd/PRD-MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop.md` updated.
- This T1-T20 document added.

## T18 Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Status |
|---|---|---|---|
| D-001 | Decision | Keep 2FA backend contract unchanged; paste support is frontend-only. | closed |

## T19 Release / Rollback

- Release: rebuild and deploy MFUSHUTTLEBUSAIBasePassengerCountingAndAnalysisInCampusBusStop frontend.
- Smoke: open 2FA dialog, paste OTP/email text, verify existing 2FA request still submits.
- Rollback: revert `TwoFA.vue` and its unit test, then rebuild frontend.

## T20 Final Handoff

Status: tested and deployed on server. Public DNS is still pending. No backend or data migration required.
