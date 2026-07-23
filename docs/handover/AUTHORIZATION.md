# Authentication and Authorization

The current system uses JWT bearer authentication with two roles: `user` and `admin`.

## Account Creation

`POST /register` creates a new account with:

- `username`
- bcrypt-hashed `password`
- `role: "user"`

The public register endpoint does not create admins. Admin users must be created or promoted directly in the database or through a trusted maintenance process.

## Login

`POST /login` checks the username and bcrypt password, then signs a JWT:

```json
{
  "id": "<mongo-user-id>",
  "role": "user-or-admin"
}
```

Token expiry is currently `1d`.

## Backend Middleware

Routes under `/api` are protected by `authMiddleware` after the livefeed public/ingest routes have been registered.

Backend behavior:

- Missing token returns `401 { "message": "No Token" }`
- Invalid token returns `401 { "message": "Invalid Token" }`
- Admin-only route accessed by non-admin returns `403 { "message": "Admin access required" }`

## Role Access Summary

Admin-only backend endpoints include:

- dashboard
- analytics
- hourly analytics
- admin map
- livefeed detection/cameras
- feedback list/update
- settings
- stations
- buses

Authenticated `user` accounts can access:

- `/api/home`
- `/api/livefeed/stream` public stream URLs
- `/api/feedback` creation
- `/api/user-map`
- `/api/user/me`

Note: `/api/livefeed/update`, `/api/livefeed/stop`, stream proxy routes, and `/api/livefeed/config` are declared before the `/api` authentication middleware. Treat these as integration/public endpoints and secure them at the network layer in production if needed.

## Frontend Route Guard

The Vue router checks:

- `localStorage.token` for authenticated pages
- `localStorage.role` for admin-only pages

Routes:

| Route | Required Role |
| --- | --- |
| `/` | public login page |
| `/home` | authenticated user/admin |
| `/livefeed` | authenticated user/admin |
| `/dashboard` | admin |
| `/analytics` | admin |
| `/feedback` | admin |
| `/setting` | admin |
| `/map` | admin |

If an unauthenticated user opens a protected route, the router redirects to `/`. If a non-admin opens an admin route, it redirects to `/home`.

## Handover Risks

- JWT secret rotation is not automated.
- Admin provisioning is not documented as an application feature.
- Client-side role checks are only a UX guard; backend admin middleware is the real enforcement.
- Livefeed ingest endpoints currently do not require JWT authentication.
