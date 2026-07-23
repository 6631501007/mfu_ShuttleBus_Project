# Handover Checklist

Use this checklist before transferring the project to another development team.

## Repository

- [ ] Current source code is committed.
- [ ] `README.md` points to the current documentation set.
- [ ] `docs/README.md` clearly separates current handover docs from AI workflow and historical records.
- [ ] Historical docs are marked as records/templates when they do not describe the current runtime system.

## Local Setup

- [ ] Backend can install dependencies and start.
- [ ] Frontend can install dependencies and build.
- [ ] AI service can install dependencies.
- [ ] Docker Compose stack can build and start.
- [ ] `.env.example` files match required runtime variables.

## Access and Secrets

- [ ] Real `.env` files are not committed.
- [ ] Production `JWT_SECRET` is stored securely.
- [ ] MongoDB credentials are transferred securely.
- [ ] Camera RTSP credentials are transferred securely.
- [ ] Admin account provisioning steps are documented for the receiving team.

## Database

- [ ] MongoDB backup is created.
- [ ] Restore procedure has been tested or documented.
- [ ] Collections and schema expectations are documented in `DATABASE.md`.
- [ ] Any seed/admin data requirements are documented.

## Application Behavior

- [ ] Login works.
- [ ] User routes work.
- [ ] Admin routes work.
- [ ] Dashboard loads.
- [ ] Map loads station data.
- [ ] Settings save hardware and zones.
- [ ] Feedback submission and admin response work.
- [ ] Analytics loads current data.

## AI and Livefeed

- [ ] Camera configuration is documented.
- [ ] RTSP source can be reached from the runtime environment.
- [ ] Livefeed stream displays.
- [ ] Detection events update livefeed status.
- [ ] Hourly analytics updates after detection events.
- [ ] Detector logs and restart behavior are understood by the receiving team.

## Deployment

- [ ] Production deployment target is known.
- [ ] Required ports are documented.
- [ ] Docker volumes are documented.
- [ ] Backup and rollback process is documented.
- [ ] Network exposure and firewall/TLS requirements are documented.

## Known Gaps

- [ ] Missing automated tests are listed.
- [ ] Known bugs are listed.
- [ ] Technical debt is listed.
- [ ] Historical docs that may be stale are identified.
- [ ] Next recommended development tasks are listed.
