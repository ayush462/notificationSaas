# NotifyStack — scalable notification API (email-first)

Plug-and-play **notification infrastructure**: API keys, Kafka queue + DLQ, PostgreSQL, Redis (rate limit + idempotency), worker delivery, and a **professional SaaS dashboard** (white/black UI).

## Features

- **Multi-tenant API** — `x-api-key`; notifications and DLQ scoped per key
- **Admin console** — optional `ADMIN_SECRET` + `x-admin-secret` for create/list/revoke keys
- **Bulk DLQ requeue** — `POST /v1/notifications/dlq/requeue-bulk` with `{ "ids": [] }`
- **Revoke keys** — `DELETE /v1/apikeys/:id`
- **Activity logs** — filter by level, search, export JSON/CSV; resend when `notificationId` is in context
- **Architecture** — see `ARCHITECTURE.md`

## Flow

`dashboard` → API (`api`) → Kafka `email_queue` → `worker` → SMTP · failures → `email_dlq` + Postgres

## Setup (no Docker)

See `SETUP_LOCAL.md`

## Hosting (free tier options, not AWS-only)

See `HOSTING_GUIDE.md`
