# Local setup (Windows)

## 1) Install dependencies

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Kafka 4.x (KRaft mode, no Zookeeper)

## 2) Kafka KRaft

Use the official Kafka 4 binary in KRaft mode (single-node dev). Listeners on `localhost:9092`.

## 3) Database

```sql
CREATE DATABASE notifications;
```

```bash
cd api
copy .env.example .env
```

Optional: set `ADMIN_SECRET` in `api/.env` (same value you will paste in the dashboard as **Admin secret**). If unset, key management routes are open (dev only).

```bash
npm install
npm run migrate
npm run create-topics
```

## 4) Worker

```bash
cd worker
copy .env.example .env
npm install
npm run dev
```

## 5) API

```bash
cd api
npm run dev
```

## 6) API keys (with `ADMIN_SECRET` set)

```bash
curl -X POST http://localhost:3000/v1/apikeys ^
  -H "x-admin-secret: YOUR_ADMIN_SECRET" ^
  -H "Content-Type: application/json" ^
  -d "{\"appName\":\"my-app\",\"ownerEmail\":\"owner@example.com\"}"
```

Revoke:

```bash
curl -X DELETE http://localhost:3000/v1/apikeys/1 -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

## 7) Send notification

```bash
curl -X POST http://localhost:3000/v1/notifications -H "x-api-key: <API_KEY>" -H "x-idempotency-key: req-1" -H "Content-Type: application/json" -d "{\"recipientEmail\":\"user@example.com\",\"subject\":\"Hi\",\"body\":\"Welcome\"}"
```

## 8) Bulk requeue DLQ

```bash
curl -X POST http://localhost:3000/v1/notifications/dlq/requeue-bulk -H "x-api-key: <API_KEY>" -H "Content-Type: application/json" -d "{\"ids\":[\"id1\",\"id2\"]}"
```

## 9) Dashboard

```bash
cd dashboard
copy .env.example .env
npm install
npm run dev
```

Paste **API key** and (if used) **Admin secret**, then **Save credentials**.

## Useful endpoints

- `GET /health`
- `GET /v1/notifications`
- `GET /v1/notifications/dlq`
- `POST /v1/notifications/dlq/:id/requeue`
- `POST /v1/notifications/dlq/requeue-bulk`
- `GET /v1/logs?level=error&q=notification`
- `GET /v1/logs/export?format=json|csv`
