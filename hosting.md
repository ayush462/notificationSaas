# NotifyStack Production Hosting Guide

This guide details how to securely host NotifyStack entirely manually on a Virtual Private Server (VPS) such as Ubuntu 22.04.

---

## 1. Security Overview

NotifyStack handles critical infrastructure events and user data. The codebase has been built with security in mind:

- **Passwords:** Hashed using bcrypt (12 salt rounds).
- **API Keys:** SHA-256 hashed in transit and at rest.
- **Tokens:** JWT-based session state to reduce database query loads.
- **SQL Injection:** Parameterized `$1` database query drivers are used across the entire API.
- **Auth Bypassing:** Guarded endpoints (`requireAuth` for standard, `requireRole` for Admin).
- **Rate Limiting:** `express-rate-limit` enforces usage caps per IP to block rudimentary DDoS / scraping attacks.

### Mandatory Environment Changes for Production

Before launching, update your `.env` values:
1. `NODE_ENV=production` — Disables Express stack traces from leaking code logic.
2. `JWT_SECRET` — Replace with a cryptographic 64-character random string (e.g., generated via `openssl rand -hex 64`).
3. `CORS_ORIGIN` — Must be explicitly set to your dashboard's domain (e.g., `https://dashboard.yourdomain.com`).
4. **Database Defaults:** Change `postgres://notifystack:password@...` to a highly secure database password, and restrict DB port access entirely from the public internet.

---

## 2. Infrastructure Deployment (Ubuntu VPS)

### Install Node.js, Postgres & Redis

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib redis-server

# Secure DB and Create User
sudo -u postgres psql
> CREATE DATABASE notifications;
> CREATE USER notifystack WITH PASSWORD 'strong_db_password_here';
> GRANT ALL PRIVILEGES ON DATABASE notifications TO notifystack;
> \q
```

### Install Kafka (Manually/Systemctl)
Kafka on a dedicated VM or managed service (like Upstash or Confluent Cloud) is vastly easier. If installing manually:
- Install Java (`sudo apt install openjdk-11-jdk`).
- Download and unpack Apache Kafka.
- Bind `zookeeper` and `kafka` to systemd scripts to run as background services.

---

## 3. Application Deployment via PM2

Using a process manager like [PM2](https://pm2.keymetrics.io/) ensures zero-downtime reloads and process resurrection on crashes.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Clone Repo and Install Deps
git clone <repo-url>
cd notification/api && npm ci
cd ../worker && npm ci
cd ../dashboard && npm ci && npm run build
```

Configure Environment Variables as instructed above using `.env` files in `api` and `worker`. Then, start the services:

```bash
# Start API
cd ~/notification/api
pm2 start index.js --name "notify-api"

# Start Worker
cd ~/notification/worker
pm2 start index.js --name "notify-worker"

# Save PM2 processes to launch on system reboot
pm2 save
pm2 startup
```

---

## 4. Secure the Frontend and Reverse Proxy (Nginx)

Next, hook the public facing port to your React application and internal API using Nginx as a reverse proxy.

1. **Copy the React build to web root:**
   ```bash
   sudo cp -r ~/notification/dashboard/dist/* /var/www/html/
   ```

2. **Configure Nginx:**
   Create `/etc/nginx/sites-available/notifystack`:

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /v1/ {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable block & Secure with SSL:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/notifystack /etc/nginx/sites-enabled/
   sudo systemctl restart nginx

   # Set up free HTTPS via Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 5. SMTP and Spam Verification (Crucial)

To ensure high-deliverability on email routing:

1. Never use your root domain (e.g. `maindomain.com`) as the `SMTP_FROM`. Use `noreply@notifications.maindomain.com` to isolate reputation hits.
2. In your DNS settings, explicitly add an **SPF Recrod** specific to your SMTP provider.
3. Configure **DKIM**. For NotifyStack, you can specify `DKIM_DOMAIN`, `DKIM_SELECTOR`, and your raw `DKIM_PRIVATE_KEY` in the `worker/.env` to auto-sign messages locally if bypassing a fully managed third-party like SendGrid. 
4. Add a stringent **DMARC policy**.
