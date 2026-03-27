# NotifyStack — Architecture & scalability

## Product shape (SaaS)

- **Tenants** authenticate with `x-api-key`. Each key maps to a stored hash; notifications and DLQ views are scoped to that tenant.
- **Dashboard** uses the same API key for sends/logs, plus optional `x-admin-secret` (when `ADMIN_SECRET` is set on the API) to create, list, and revoke keys.

## Data flow

1. **Client app (your customer’s backend)** → `POST /v1/notifications` with JSON body and `x-api-key`.
2. **API** validates key, applies **Redis** rate limit + idempotency (`x-idempotency-key`), inserts row in **PostgreSQL**, publishes to **Kafka** `email_queue`.
3. **Workers** (N replicas, same consumer group) consume Kafka, send email (SMTP), update Postgres (`sent` / `retrying` / `failed`).
4. On permanent failure, payload is also written to **DLQ topic**; row stays `failed` for dashboard/API.

## Horizontal scaling

| Layer | Scale by |
|--------|-----------|
| API | More Node processes behind a load balancer; stateless except Redis/DB/Kafka clients. |
| Redis | Cluster or larger instance; used for counters and idempotency keys. |
| Kafka | More partitions on `email_queue`; add broker nodes as traffic grows. |
| Workers | Increase consumer instances (same `group.id`); partitions distribute load. |
| PostgreSQL | Read replicas for reporting; primary for writes (or managed Postgres). |

## Why not one database queue?

Kafka gives **backpressure**, **replay**, and **ordering per key** without polling Postgres. Postgres remains the **source of truth** for status and audit.

## Security notes

- Set `ADMIN_SECRET` in production and store it only on the server + dashboard env.
- Never expose Kafka or Redis ports publicly; only the HTTPS API should be internet-facing.
