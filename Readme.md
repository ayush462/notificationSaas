# NotifyStack — Multi-Channel Notification SaaS Platform

Production-ready notification infrastructure for email, SMS, and push notifications.
Built with Node.js, PostgreSQL, Redis, Kafka, and React.

---

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────────────┐
│   Dashboard      │────▶│   API Server │────▶│        Kafka            │
│   (React/Vite)   │     │   (Express)  │     │  email_queue / email_dlq│
└─────────────────┘     └──────────────┘     └─────────┬───────────────┘
                              │                         │
                              │                         ▼
                         ┌────┴────┐         ┌─────────────────────┐
                         │PostgreSQL│         │     Worker          │
                         │  Redis   │         │  ┌───────────────┐  │
                         └─────────┘         │  │ SMTP/SendGrid │  │
                                              │  │ Mailgun/Twilio│  │
                                              │  │ FCM/WebPush   │  │
                                              │  └───────────────┘  │
                                              └─────────────────────┘
```

## Features

### Multi-Channel Delivery
- **Email**: SMTP, SendGrid, Mailgun with auto-failover
- **SMS**: Twilio integration
- **Push**: Firebase Cloud Messaging + Web Push (VAPID)

### Reliability
- Multi-provider routing with weighted selection (70/30 split etc.)
- Circuit breaker (auto-disable provider after 5 failures, re-enable after 60s)
- Exponential backoff retry (1m → 5m → 30m → 2h → 6h) with ±20% jitter
- Dead Letter Queue with bulk retry
- Idempotency (safe retries via `x-idempotency-key`)

### Security
- JWT authentication + API key auth (SHA-256 hashed, Stripe-style `ntf_live_` prefix)
- RBAC (USER / ADMIN roles)
- Rate limiting per API key (Redis-backed)
- Helmet security headers
- DKIM email signing support
- Usage limit enforcement per plan

### Dashboard
- Real-time analytics with Recharts (line, bar, pie charts)
- Multi-project management
- Notification history with filters + export (JSON/CSV)
- Log viewer with quick filter pills (errors, DLQ, retries)
- HTML email template builder with live preview
- Billing & usage tracking

### Authentication
- Email + password signup/login
- Google OAuth (Sign in with Google)
- OTP-based login (6-digit code via email)

### Billing (Stripe)
- Free (1,000/mo), Pro ($29 - 50K/mo), Scale ($99 - unlimited)
- Stripe Checkout + Customer Portal
- Webhook handling (subscription lifecycle)
- Monthly usage tracking per channel
- Invoice history

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- Kafka (via Docker recommended)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd notification

# Install all services
cd api && npm install && cd ..
cd worker && npm install && cd ..
cd dashboard && npm install && cd ..
```

### 2. Start infrastructure

```bash
# Using Docker (recommended)
docker run -d --name postgres -e POSTGRES_DB=notifystack -e POSTGRES_USER=notifystack -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16-alpine
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name zookeeper -e ZOOKEEPER_CLIENT_PORT=2181 confluentinc/cp-zookeeper:7.5.0
docker run -d --name kafka -e KAFKA_BROKER_ID=1 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 --link zookeeper -p 9092:9092 confluentinc/cp-kafka:7.5.0
```

### 3. Initialize database

```bash
cd api
psql postgres://notifystack:password@localhost:5432/notifystack < db/schema.sql
```

### 4. Configure environment

Create `api/.env`:
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://notifystack:password@localhost:5432/notifystack
REDIS_URL=redis://127.0.0.1:6379
KAFKA_BROKERS=localhost:9092
JWT_SECRET=your-secret-change-this
CORS_ORIGIN=http://localhost:5173
```

Create `worker/.env`:
```
DATABASE_URL=postgres://notifystack:password@localhost:5432/notifystack
REDIS_URL=redis://127.0.0.1:6379
KAFKA_BROKERS=localhost:9092
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=yourmail@gmail.com
```

### 5. Start services

```bash
# Terminal 1: API
cd api && node index.js

# Terminal 2: Worker
cd worker && node index.js

# Terminal 3: Dashboard
cd dashboard && npm run dev
```

Visit `http://localhost:5173` — sign up, create a project, and start sending.

### 6. Promote admin

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Docker Compose (Full Stack)

```bash
# Start everything
docker compose up -d

# Initialize schema (first time only)
docker compose exec postgres psql -U notifystack -d notifystack < api/db/schema.sql

# Check health
curl http://localhost:3000/health
```

Dashboard: `http://localhost`
API: `http://localhost:3000`

---

## SDK Usage

### Install

```bash
npm install ./sdk
# or publish to npm and: npm install notify-saas-sdk
```

### Email

```javascript
const NotifySDK = require("notify-saas-sdk");
const notify = new NotifySDK("ntf_live_your_key_here", {
  baseUrl: "http://localhost:3000",
  debug: true
});

// Event-based (uses template)
await notify.track("USER_SIGNUP", {
  email: "user@example.com",
  name: "Ayush"
});

// Direct email
await notify.send({
  to: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up."
});
```

### SMS

```javascript
await notify.sendSms({
  to: "+1234567890",
  body: "Your verification code is 123456"
});
```

### Push Notification

```javascript
await notify.sendPush({
  token: "device_fcm_token_here",
  title: "New Message",
  body: "You have a new notification",
  data: { screen: "inbox" }
});
```

### Batch

```javascript
const result = await notify.sendBatch([
  { recipientEmail: "a@test.com", subject: "Hello A", body: "Hi", channel: "email" },
  { recipientEmail: "b@test.com", subject: "Hello B", body: "Hi", channel: "email" }
]);
console.log(`Sent: ${result.succeeded}, Failed: ${result.failed}`);
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/signup` | Register (name, email, password) |
| POST | `/v1/auth/login` | Login (email, password) |
| GET | `/v1/auth/me` | Current user |
| POST | `/v1/auth/google` | Google OAuth login (idToken) |
| POST | `/v1/auth/otp/send` | Send OTP (email) |
| POST | `/v1/auth/otp/verify` | Verify OTP (email, otp) |

### Notifications (API Key auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/notifications` | Send notification (email/sms/push) |
| GET | `/v1/notifications` | List project notifications |
| GET | `/v1/notifications/dlq` | List DLQ items |
| POST | `/v1/notifications/dlq/:id/requeue` | Retry single DLQ item |
| POST | `/v1/notifications/dlq/requeue-bulk` | Retry multiple (ids[]) |

### Analytics (JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/analytics/overview` | Total, success/fail rate, latency |
| GET | `/v1/analytics/timeseries` | Volume over time |
| GET | `/v1/analytics/providers` | Per-provider performance |
| GET | `/v1/analytics/channels` | Email vs SMS vs Push breakdown |
| GET | `/v1/analytics/events` | Top events by volume |

### Billing (JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/billing/plans` | Available plans |
| GET | `/v1/billing/plan` | Current user plan |
| GET | `/v1/billing/usage` | Monthly usage + history |
| POST | `/v1/billing/checkout` | Stripe checkout (planId) |
| POST | `/v1/billing/portal` | Stripe customer portal |
| GET | `/v1/billing/invoices` | Invoice history |

---

## Production Hosting Guide

### Option 1: Railway (Easiest)

1. Push to GitHub
2. Go to [railway.app](https://railway.app), create project
3. Add services: PostgreSQL, Redis (from Railway templates)
4. Add custom services from your repo:
   - **API**: root dir = `api`, start = `node index.js`
   - **Worker**: root dir = `worker`, start = `node index.js`
   - **Dashboard**: root dir = `dashboard`, build = `npm run build`, start = static serve
5. For Kafka: use [Upstash Kafka](https://upstash.com) (free tier)
6. Set env vars in Railway dashboard

### Option 2: DigitalOcean / Hetzner VPS

```bash
# On your VPS (Ubuntu 22.04)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin

# Clone and deploy
git clone <repo> && cd notification
cp api/.env.example api/.env    # Edit with real values
cp worker/.env.example worker/.env

# Start
docker compose up -d

# Setup SSL with Caddy
sudo apt install caddy
# Caddyfile:
# yourdomain.com {
#   reverse_proxy localhost:80
# }
```

### Email Deliverability (Prevent Spam)

1. **SPF**: Add DNS TXT record: `v=spf1 include:_spf.google.com ~all`
2. **DKIM**: Generate key pair, add DNS TXT record, set `DKIM_PRIVATE_KEY` in worker env
3. **DMARC**: Add DNS TXT record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com`
4. **Use a custom domain** for sending (not gmail.com)
5. **Set proper From header** matching your domain

### Gmail App Password (for SMTP)
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Use that 16-char password as `SMTP_PASS`

---

## Environment Variables Reference

### API Service
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://127.0.0.1:6379` | Redis connection string |
| `KAFKA_BROKERS` | Yes | `localhost:9092` | Kafka broker addresses |
| `JWT_SECRET` | Yes | — | JWT signing secret (64+ chars) |
| `CORS_ORIGIN` | Yes | — | Frontend URL |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |

### Worker Service
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Same PostgreSQL URL |
| `REDIS_URL` | Yes | — | Same Redis URL |
| `KAFKA_BROKERS` | Yes | — | Same Kafka brokers |
| `SMTP_HOST` | Yes* | — | SMTP server host |
| `SMTP_USER` | Yes* | — | SMTP username |
| `SMTP_PASS` | Yes* | — | SMTP password |
| `SENDGRID_API_KEY` | No | — | SendGrid (enable as fallback) |
| `TWILIO_ACCOUNT_SID` | No | — | Twilio SMS |
| `TWILIO_AUTH_TOKEN` | No | — | Twilio SMS |
| `TWILIO_FROM_NUMBER` | No | — | Twilio sender number |

*At least one email provider is required.

---

## Project Structure

```
notification/
├── api/                    # Express API server
│   ├── config/
│   ├── controllers/
│   ├── db/                 # Pool + schema.sql
│   ├── kafka/              # Producer
│   ├── middleware/          # Auth, rate limit, usage, audit
│   ├── redis/              # Idempotency
│   ├── routes/             # All route files
│   └── services/           # Business logic
├── worker/                 # Kafka consumer + notification delivery
│   ├── config/
│   ├── kafka/              # Consumer + producer (DLQ)
│   ├── providers/          # SMTP, SendGrid, Mailgun, Twilio, FCM, WebPush
│   ├── services/           # Router, email sender, templates
│   └── utils/              # Logger
├── dashboard/              # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Badge, Pagination, Toast, etc.
│   │   ├── contexts/       # Auth, Project providers
│   │   ├── layouts/        # MainLayout with responsive sidebar
│   │   ├── lib/            # API client, utils
│   │   └── pages/          # All dashboard pages
│   └── nginx.conf          # Production Nginx config
├── sdk/                    # Node.js SDK (npm package)
├── docker-compose.yml      # Full stack deployment
└── Readme.md               # This file
```

---

## License

MIT
