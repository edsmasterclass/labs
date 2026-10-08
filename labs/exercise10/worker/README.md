# Service-booking Worker

This folder keeps the Worker source, Wrangler configuration, and D1 schema setup, following the Exercise 6 pattern. By default, learners use the already-hosted API; no local backend, package installation, or test runner is needed. Deployment to your own Cloudflare account is optional and covered below.

The database setup SQL is in [schema/0001_bookings.sql](schema/0001_bookings.sql). Wrangler calls versioned schema changes "migrations"; `migrations_dir = "schema"` tells its migration commands to use this folder.

Live API: https://eds-labs-service-booking.aem-poc-lab.workers.dev

## Code flow

Start with the exported `fetch` function in [worker.js](worker.js): check the origin, handle preflight, call the matching route handler, and return JSON. Expected request errors keep their HTTP status; unexpected failures are logged and return `500`.

- `getServices`: return the services and local booking date range.
- `getAvailableSlots`: convert local working hours to UTC and exclude booked D1 slots.
- `createBooking`: validate the request, reserve a slot, and return the booking reference. Identical retries reuse the reference; conflicts return `409`.
- `scheduled`: remove past bookings daily.

The route handlers and request/origin helpers stay in the same file. [booking-model.js](booking-model.js) holds the services, hours, and validation rules; the shared [booking-time.js](../support/booking-time.js) handles time-zone conversion and widget time labels. All Worker dependencies live under Exercise 10, so deployment does not require the completed widget from the demo branch.

## Instructor deployment

Requirements: Node.js 20 or newer, Wrangler 4 installed (`npm install -g wrangler` if needed), and Cloudflare Workers/D1 deployment permissions.

From the repository root:

```bash
cd labs/exercise10/worker
wrangler login
wrangler whoami
cp wrangler.toml wrangler.local.toml
```

[wrangler.toml](wrangler.toml) is a template with placeholder account and database IDs. Keep deployment-specific values in `wrangler.local.toml`, which the repository's root `.gitignore` excludes along with local Wrangler state and environment files. Do not commit account/database IDs or credentials.

For the shared instructor deployment, set `account_id` and `database_id` in `wrangler.local.toml` to the intended account and existing D1 database. **Do not recreate the database for normal redeployments.** Redeployment preserves bookings. Worker and EDS code deployments are separate; do not deploy automatically from learner branches. Ensure any `CLOUDFLARE_ACCOUNT_ID` environment variable matches the intended account, or unset it.

### Own Cloudflare account (optional)

1. Log in with your own Cloudflare user and check the account name/ID in `wrangler whoami`. **Before creating resources or deploying**, replace `YOUR_ACCOUNT_ID` in `wrangler.local.toml` with your account ID.
2. Run `wrangler d1 create eds-labs-service-booking --config wrangler.local.toml`. Replace `YOUR_DATABASE_ID` in `wrangler.local.toml` with the returned ID, keeping `binding = "DB"`.
3. Run `wrangler d1 migrations apply eds-labs-service-booking --remote --config wrangler.local.toml` to create the tables from `schema/`.
4. If using another EDS repository, set `EDS_SITE` to `<repo>--<owner>` and add any custom-domain origins to `ALLOWED_ORIGINS`. Optionally change the Worker `name` if that name is already in use in your account.
5. Run the deployment commands below. Copy **your** deployed HTTPS URL into the `widgets/service-booking/config.js` file you create using the [exercise instructions](../instructions.md); it will use your account's Workers subdomain, not `aem-poc-lab.workers.dev`.

### Deploy or redeploy

Once the intended account and database are configured:

```bash
wrangler deploy --dry-run --config wrangler.local.toml
wrangler deploy --config wrangler.local.toml
```

For later schema changes, apply pending migrations before redeploying. If you change the database name, update both configuration and commands. Keep `binding = "DB"` to match the Worker.

Set the deployed URL in your widget's `config.js`. Keep the sibling [support/](../support/) folder when redeploying: the Worker imports its time-zone helper and date parser from there.

Origins are controlled by `ALLOWED_ORIGINS` (comma-separated exact origins) and `EDS_SITE` (`<repo>--<owner>` for Preview/Live hosts). The current configuration permits localhost and this repository's AEM hosts. Add custom domains explicitly; CORS is not authentication.

## Verify

These examples use the shared lab endpoint. For your own deployment, replace the hostname with the URL printed by Wrangler.

```bash
curl 'https://eds-labs-service-booking.aem-poc-lab.workers.dev/services?timeZone=Asia%2FKolkata'
curl -i -H 'Origin: http://localhost:3000' 'https://eds-labs-service-booking.aem-poc-lab.workers.dev/services?timeZone=Asia%2FKolkata'
```

Open the authored page locally. Verify 9 AM–4 PM local slots, required contact fields, a personalized green confirmation, and refreshed availability after booking. A `409` conflict must clear the stale selection and refresh availability; uncertain network/server failures preserve the request ID for safe retries. Confirmations from multiple instances queue one at a time, each with an eight-second display, close button, and hover/focus pause. Confirm mobile stacking, keyboard controls, errors/retries, and independent form state. Push frontend changes to your branch before checking its AEM preview URL.

## API contract

| Request | Response |
| --- | --- |
| `GET /services?timeZone=Asia%2FKolkata` | `{ services: [{ id, label }], minDate, maxDate, timeZone }`; dates are local to that zone |
| `GET /slots?service=consultation&date=YYYY-MM-DD&timeZone=Asia%2FKolkata` | The requested date is local; returns `{ slots: [{ date: "YYYY-MM-DD", slot: "03:30" }, ...] }` with UTC slot identities |
| `POST /bookings` | JSON `{ service, date, slot, timeZone, name, email, requestId }`; `date` and `slot` are UTC; returns `{ reference }` |

D1 always stores UTC dates and times. Services are `consultation` and `support`; local start times are `09:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, and `16:00`. The last appointment starts at 4:00 PM; 5:00 PM is not offered as a start time. Bookings for the same service and exact UTC slot share availability across time zones.

For callers omitting `timeZone`, the API defaults to UTC. `/services` retains its original response shape, `/slots` returns the original string-array shape, and bookings without `timeZone` are validated against UTC working hours. Invalid time zones return `400`.

Booking requests require JSON, at most 4 KiB, valid contact fields, and a UUID v4 request ID. New bookings return `201`; identical retries return `200` with the same reference; slot/request conflicts return `409`. Other errors return a non-success status and `{ error }`, with explicit logging and `Cache-Control: no-store`.

D1 unique constraints and a transactional insert/lookup prevent double bookings and duplicate retries even during concurrent requests.

## Shared availability and data retention

Use fictitious details only. No appointment or email is sent. Names and email addresses are validated but not stored as plaintext; the database stores a SHA-256 hash of the booking details for retry matching, along with request ID, reference, service, date, time, and creation timestamp. Hashing is data minimization, not a guarantee of anonymization.

A daily midnight-UTC cron deletes bookings whose appointment date is in the past. D1 backups may retain deleted data according to your account's retention settings.

To reset availability **between class sessions**, notify learners and explicitly clear the demo bookings:

```bash
wrangler d1 execute eds-labs-service-booking --remote --config wrangler.local.toml --command "DELETE FROM bookings"
```

This clears current demo reservations and retry history in the active database. Do not reset during testing of idempotency or persistence.

This is a **hosted classroom demo**, not a production-ready booking service. Production requires appropriate authentication/authorization, rate limiting and other abuse controls, privacy policies, monitoring, and operational ownership. A fixed public endpoint and CORS do not provide those controls.

## References

- [Worker configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [D1 transactional batches](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)
