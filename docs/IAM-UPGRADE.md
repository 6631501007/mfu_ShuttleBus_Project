# IAM Upgrade Guide

## Purpose

This project template is designed so IAM updates affect one adapter boundary instead of the whole project.

## Safe Upgrade Path

1. Review the target IAM API contract change.
2. Check whether token path, admin base path, scope, audience, or response shape changed.
3. Update only `server/integrations/iam/iam-sdk-adapter.js` when the change is transport-level.
4. Update `project-iam-service.js` only if the business-facing IAM contract changed.
5. Re-run `node --test test/*.test.js`.

## Rules

- Do not import internal IAM repository modules.
- Do not spread IAM request logic into controllers or business services.
- Keep compatibility knobs in env:
  - `IAM_SDK_TOKEN_PATH`
  - `IAM_SDK_INTROSPECT_PATH`
  - `IAM_SDK_PROFILE_PATH`
  - `IAM_SDK_ADMIN_BASE_PATH`
  - `IAM_COMPAT_PROFILE`

## Breaking Change Triggers

Treat these as breaking changes and validate carefully:

- token endpoint path changed
- admin route path changed
- token introspection response shape changed
- client profile response shape changed
- permission or account admin endpoints changed
