# 🔔 NotifyStack — System Architecture

*A high-throughput, multi-channel notification engine built on modern distributed patterns.*

## 🏗️ Architecture Overview

The system is designed for high-availability and reliability, using **Kafka** for decoupling processing, **Redis** for rate-limiting and circuit-breaking, and **PostgreSQL** as the unified source of truth for notification status.

```mermaid
graph TD
    subgraph Client ["<b>Client Layer</b>"]
        SDK["SDK (@ayush0x44/notifystack)"]
        API_REQ["API Requests (POST /v1/notifications)"]
    end

    subgraph Ingestion ["<b>Ingestion Layer (Render API)</b>"]
        Express["Express.js Server"]
        Auth["API Key Auth"]
        RateLimit["Rate Limiter (Redis)"]
        Idempotency["Idempotency Check (Redis)"]
    end

    subgraph Storage ["<b>Data & Messaging (Cloud)</b>"]
        Postgres[(PostgreSQL - Neon)]
        Kafka{{Redpanda Kafka}}
        Redis[(Upstash Redis)]
        DLQ_Topic{{DLQ Topic / Table}}
    end

    subgraph Processing ["<b>Worker Layer (Render Worker)</b>"]
        Consumer["Kafka Consumer"]
        Processor["Notification Processor"]
        CircuitBreaker["Circuit Breaker (Redis)"]
        RetryLogic["Retry Logic (Redis Delay Queue)"]
    end

    subgraph Providers ["<b>Delivery Providers</b>"]
        Email["SendGrid / Mailgun / SMTP"]
        SMS["Twilio"]
    end

    %% Flow
    SDK --> Express
    API_REQ --> Express
    
    Express --> Auth
    Auth --> RateLimit
    RateLimit --> Idempotency
    
    Idempotency -- "1. Store State" --> Postgres
    Idempotency -- "2. Produce" --> Kafka
    
    Kafka -- "3. Consume" --> Consumer
    Consumer --> Processor
    
    Processor -- "4. Check Health" --> CircuitBreaker
    Processor -- "5. Deliver" --> Providers
    
    Processor -- "Retry" --> RetryLogic
    RetryLogic -- "Dead Letter" --> DLQ_Topic
    
    Processor -- "Update Status" --> Postgres
    
    %% Styling
    style Client fill:#f9f9f9,stroke:#333,stroke-width:2px,rx:10,ry:10
    style Ingestion fill:#e1f5fe,stroke:#01579b,stroke-width:2px,rx:10,ry:10
    style Storage fill:#fff3e0,stroke:#e65100,stroke-width:2px,rx:10,ry:10
    style Processing fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,rx:10,ry:10
    style Providers fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,rx:10,ry:10
```

---

*For detailed internal documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).*
