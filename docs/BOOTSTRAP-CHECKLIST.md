# Bootstrap Checklist

## Before First Run

1. Confirm the real env files exist for local, preprod, and production.
1. Set `PROJECT_*` values in your real environment file.
1. Onboard the application and environment in IAM.
1. Set the correct `IAM_SDK_*` credentials for that environment.
1. Confirm the required audience and scopes with the IAM team.

## First Validation

1. Run `node --test test/*.test.js` in `backend-node`.
1. Run `npm run bootstrap:permissions`.
1. Verify the expected security type, group, and menus were created in IAM.
1. Verify the target application can request a token and pass introspection.

## Before Adding Business Modules

1. Keep all IAM HTTP access inside `server/integrations/iam`.
2. Add any new IAM endpoint support through the adapter first.
3. Put new business permission paths in `PROJECT_PERMISSION_PATHS`, not in source code.
