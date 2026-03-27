# NotifyStack Local Setup Guide (Manual / No-Docker)

This guide walks you through setting up NotifyStack completely manually on a local machine (Windows, Mac, or Linux) without using Docker. 

> **Important Prerequisites:** Ensure you have Node.js (v20+) installed on your machine.

---

## 1. Setup Backend Services (Databases & Messages)

### PostgreSQL Database
1. Download and install PostgreSQL.
   - **Windows/Mac**: Download the installer from the official PostgreSQL website.
   - **Linux**: `sudo apt install postgresql postgresql-contrib`
2. Start the PostgreSQL server.
3. Open `psql` or pgAdmin and run:
   ```sql
   CREATE DATABASE notifications;
   -- Important: Set a secure password for production setups.
   CREATE USER notifystack WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE notifications TO notifystack;
   ```

### Redis Server
Used for caching, deduplication (idempotency), and rate-limiting.
- **Mac**: `brew install redis && brew services start redis`
- **Linux**: `sudo apt install redis-server && sudo systemctl enable --now redis-server`
- **Windows**: Install Memurai (Redis compatible for Windows) or run Redis inside WSL (Windows Subsystem for Linux).

### Apache Kafka (with Zookeeper)
Kafka acts as the message queue between your API and worker.
1. Download the latest Kafka binaries from the [Apache Kafka site](https://kafka.apache.org/downloads).
2. Extract the archive.
3. Start Zookeeper (in terminal 1):
   ```bash
   bin/zookeeper-server-start.sh config/zookeeper.properties
   # On Windows: bin\windows\zookeeper-server-start.bat config\zookeeper.properties
   ```
4. Start Kafka Server (in terminal 2):
   ```bash
   bin/kafka-server-start.sh config/server.properties
   # On Windows: bin\windows\kafka-server-start.bat config\server.properties
   ```

---

## 2. Initialize the Database

Load the schema into your newly created database. Open a command prompt inside the `notification/api` directory and run:

```bash
# Assuming psql is in your PATH
psql postgres://notifystack:password@localhost:5432/notifications -f db/schema.sql
```

---

## 3. Configure the Application Environments

Navigate to the respective folders and edit your `.env` files.

### API Environment (`api/.env`)
Create `notification/api/.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://notifystack:password@localhost:5432/notifications
REDIS_URL=redis://127.0.0.1:6379
KAFKA_BROKERS=localhost:9092
JWT_SECRET=super_secret_string_for_local_dev
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=120
```

### Worker Environment (`worker/.env`)
Create `notification/worker/.env`:

```env
DATABASE_URL=postgres://notifystack:password@localhost:5432/notifications
REDIS_URL=redis://127.0.0.1:6379
KAFKA_BROKERS=localhost:9092
MAX_RETRIES=5

# Example Mock SMTP Config (Create an Ethereal Account or use Mailtrap for local dev)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
SMTP_FROM=local@notifystack.dev
```

---

## 4. Run the Nodes!

You will need three separate terminal windows to run the API, Worker, and React Dashboard.

**Terminal 1 — The API:**
```bash
cd api
npm install
node index.js
```

**Terminal 2 — The Delivery Worker:**
```bash
cd worker
npm install
node index.js
```

**Terminal 3 — The React Dashboard:**
```bash
cd dashboard
npm install
npm run dev
```

The system is now running locally. Open your browser to `http://localhost:5173` to access the dashboard!
