# Database Model

The backend uses MongoDB through Mongoose models in `backend-node/models/`.

## Collections

| Model | Default Collection | Purpose |
| --- | --- | --- |
| `User` | `users` | Login accounts and roles. |
| `Station` | `stations` | Bus stop/station metadata and current passenger status. |
| `Bus` | `buses` | Bus records and operational status. |
| `Feedback` | `feedbacks` | User feedback and admin responses. |
| `Setting` | `settings` | Global zones, notification settings, hardware, camera livefeed config. |
| `Analytics` | `analytics` | Dashboard chart and aggregate analytics data. |
| `HourlyAnalytics` | `hourly_analytics` | Hourly queue metrics generated from live AI detections. |

## User

Fields:

- `username`
- `password` - bcrypt hash
- `role` - `user` or `admin`, defaults to `user`
- timestamps

The login route signs JWT payload `{ id, role }`.

## Station

Fields:

- `stationId` - required, unique
- `name` - required
- `desc`
- `zone`
- `location.lat`, `location.lng`
- `capacity`
- `waitingPassengers`
- `incomingBuses`
- `status` - `normal`, `alert`, or `critical`
- timestamps

Station data powers dashboard KPIs, map views, user home rankings, and user/admin map APIs.

## Bus

Fields:

- `busId` - required, unique
- `route`
- `status` - `on route`, `standby`, or `maintenance`
- `currentLocation.lat`, `currentLocation.lng`
- `eta`
- timestamps

Bus status feeds dashboard counts.

## Feedback

Fields:

- `userName` - required
- `message` - required
- `rating` - 1 to 5
- `status` - `unresolved` or `resolved`
- `response`
- timestamps

Feedback is created by authenticated users and resolved by admins.

## Setting

`Setting` stores both global configuration and hardware/camera configuration.

Top-level fields:

- `zones[]` - operational station zones
- `notificationChannels.emailEnabled`
- `notificationChannels.smsEnabled`
- `notificationChannels.emails[]`
- `notificationChannels.mobiles[]`
- `delayThreshold`
- `hardware[]`
- `livefeed`
- timestamps

Hardware fields:

- `deviceId`
- `name`
- `type` - `sensor`, `camera`, or `other`
- `ip`
- `rtspUrl`
- `fw`
- `status` - `online` or `offline`
- `details`
- `livefeed.dwellSeconds`
- `livefeed.referenceImage`
- `livefeed.zones[]`

Livefeed zones use percentage coordinates:

- `name`
- `x`
- `y`
- `width`
- `height`
- `color`
- `enabled`

The backend currently normalizes livefeed zones to one counting zone and strips reference image payloads from most settings responses unless explicitly requested.

## Analytics

Fields:

- `dateRanges[]`
- `terminals[]`
- `metrics.avgPassengerFlow`
- `metrics.peakOccupancy`
- `metrics.avgWaitTime`
- `metrics.totalEntries`
- `weeklyData[]`
- `monthlyData[]`
- `previousData[]`
- timestamps

The dashboard and analytics views read the latest analytics document by `createdAt`.

## HourlyAnalytics

Explicit collection: `hourly_analytics`.

Fields:

- `station_id`
- `camera_id`
- `date`
- `hour`
- `timestamp`
- `timezone`
- `current_queue_count`
- `max_queue_count`
- `min_queue_count`
- `avg_queue_time_seconds`
- `median_queue_time_seconds`
- `peak_time`
- `peak_queue_count`
- `total_persons_processed`
- `sample_count`
- `queue_time_samples_seconds` - hidden by default
- `last_total_persons_seen` - hidden by default
- `created_at`, `updated_at`

Indexes:

- unique `{ station_id: 1, timestamp: 1 }`
- `{ timestamp: -1 }`

The backend updates this collection when live detection data arrives and MongoDB is connected.

## Data Ownership Notes

- Source code is the authority for schema behavior.
- Settings hardware drives backend-managed detector lifecycle. Cameras with `type: "camera"`, `status: "online"`, and `rtspUrl` trigger detector processes.
- Camera-to-station mapping is inferred from hardware fields such as `stationId`, `station_id`, `station`, `name`, or the camera id fallback.
