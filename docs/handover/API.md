# API Reference

The backend is implemented in `backend-node/app.js`. Public endpoints are `/health`, `/register`, `/login`, and livefeed ingest/stream/config endpoints declared before the `/api` authentication middleware. All other `/api/*` endpoints require a bearer token. Endpoints marked `admin` also require `role: "admin"` in the JWT.

## Authentication

Use:

```http
Authorization: Bearer <jwt>
```

## Public and Ingest Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | none | Returns backend and MongoDB health. |
| `POST` | `/register` | none | Creates a normal `user` account. Body: `username`, `password`, `confirmPassword`. |
| `POST` | `/login` | none | Returns a JWT and user object. Body: `username`, `password`. |
| `POST` | `/api/livefeed/update` | none | HTTP ingest from AI detector. Updates live detection state and hourly analytics when DB is connected. |
| `POST` | `/api/livefeed/stop` | none | Clears live detection state for one camera or all cameras. |
| `GET` | `/api/livefeed/stream` | none | Proxies the configured source MJPEG stream. |
| `GET` | `/api/livefeed/stream/:cameraId` | none | Proxies a backend-managed camera detector stream. |
| `GET` | `/api/livefeed/config` | DB only | Returns livefeed config, optionally for `?cameraId=`. |

## Authenticated Endpoints

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard` | admin | KPI, passenger chart, notifications, stations, buses, recent hourly analytics. |
| `GET` | `/api/analytics` | admin | Latest analytics document. |
| `POST` | `/api/analytics` | admin | Creates an analytics document. |
| `GET` | `/api/hourly-analytics?limit=&station_id=` | admin | Returns hourly analytics, max limit 168. |
| `GET` | `/api/home` | user/admin | Home data, station list, rankings. |
| `GET` | `/api/map` | admin | Admin map station list. |
| `GET` | `/api/livefeed/detection` | admin | Current livefeed detection status. |
| `GET` | `/api/livefeed/cameras` | admin | Camera hardware list with detector runtime status. |
| `GET` | `/api/feedback` | admin | Feedback list and resolved/unresolved summary. |
| `POST` | `/api/feedback` | user/admin | Creates feedback for the authenticated user. Body: `message`, `rating`. |
| `PATCH` | `/api/feedback/:id` | admin | Updates feedback `status` and/or `response`. |
| `GET` | `/api/settings` | admin | Returns settings. `?includeReferenceImages=true` includes reference images. |
| `PUT` | `/api/settings` | admin | Upserts global settings and hardware settings. |
| `POST` | `/api/settings/zones` | admin | Adds a settings zone. |
| `PUT` | `/api/settings/zones/:index` | admin | Updates a settings zone by array index. |
| `DELETE` | `/api/settings/zones/:index` | admin | Deletes a settings zone by array index. |
| `GET` | `/api/settings/hardware` | admin | Returns hardware list. |
| `POST` | `/api/settings/hardware` | admin | Adds hardware. |
| `PUT` | `/api/settings/hardware/:hardwareId` | admin | Updates hardware by `_id`, `deviceId`, or numeric index. |
| `DELETE` | `/api/settings/hardware/:hardwareId` | admin | Deletes hardware. |
| `GET` | `/api/settings/hardware/:hardwareId/livefeed/status` | admin | Returns livefeed config and reference image byte count for one hardware item. |
| `PUT` | `/api/settings/hardware/:hardwareId/livefeed` | admin | Saves camera livefeed dwell seconds and counting zone. |
| `POST` | `/api/stations` | admin | Creates a station. |
| `GET` | `/api/stations` | admin | Lists stations. |
| `PUT` | `/api/stations-bulk` | admin | Replaces all stations. |
| `PUT` | `/api/stations/bulk` | admin | Alias for bulk station replacement. |
| `PUT` | `/api/stations/:id` | admin | Updates a station by Mongo `_id`. |
| `DELETE` | `/api/stations/:id` | admin | Deletes a station by Mongo `_id`. |
| `POST` | `/api/buses` | admin | Creates a bus. |
| `GET` | `/api/user-map` | user/admin | User map station list. |
| `GET` | `/api/user/me` | user/admin | Current user profile. |

## Livefeed Detection Payload

AI detectors send `detection:update` over Socket.IO or `POST /api/livefeed/update` over HTTP.

```json
{
  "cameraId": "cam01",
  "timestamp": 1710000000000,
  "frameWidth": 1280,
  "frameHeight": 720,
  "peopleCount": 2,
  "activeCount": 1,
  "elapsed": 12.4,
  "detections": [
    {
      "class": "person",
      "confidence": 0.91,
      "trackId": 1,
      "dwellSeconds": 31.2,
      "counted": true,
      "zoneName": "Counting Zone",
      "bbox": { "x": 100, "y": 80, "width": 220, "height": 400 }
    }
  ],
  "zones": []
}
```

`peopleCount` or `count` must be a non-negative number.

## Socket.IO Events

| Direction | Event | Purpose |
| --- | --- | --- |
| detector/client -> backend | `detection:update` | Updates live detection state and hourly analytics. |
| backend -> clients | `detection:broadcast` | Broadcasts the normalized live detection status. |
| backend -> sender | `detection:error` | Sent when a detection payload is invalid. |

## Error Patterns

- Missing bearer token: `401 { "message": "No Token" }`
- Invalid JWT: `401 { "message": "Invalid Token" }`
- Non-admin access to admin endpoint: `403 { "message": "Admin access required" }`
- Database unavailable after `/api` middleware: `503 { "message": "Database unavailable", ... }`
