# NotifyStack Node.js SDK

[![npm version](https://img.shields.io/npm/v/@ayush0x44/notifystack.svg)](https://www.npmjs.com/package/@ayush0x44/notifystack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official Node.js SDK for **NotifyStack** — a high-performance, distributed notification SaaS platform. Send Emails, SMS, Push, and In-App notifications with a single unified API.

## 🚀 Features

- **Zero Dependencies**: Lightweight and fast (uses native `fetch`).
- **Unified API**: One interface for all channels (Email, SMS, Push, In-App).
- **Auto-Retry**: Built-in exponential backoff for network flakes.
- **Idempotency**: Safe retries without duplicate notifications.
- **Batching**: Send up to 100 notifications in a single call.

## 📦 Installation

```bash
npm install @ayush0x44/notifystack
```

## 🛠️ Quick Start

```javascript
const { NotifySDK } = require("@ayush0x44/notifystack");

// Initialize the client
const notify = new NotifySDK("ntf_live_your_api_key", {
  baseUrl: "https://notificationsaas.onrender.com" // Point to your cloud API
});

async function main() {
  // 1. Send an Event-based notification (uses templates)
  await notify.track("ORDER_PLACED", {
    email: "customer@example.com",
    orderId: "ORD-123"
  });

  // 2. Send a direct Email
  await notify.send({
    to: "hello@world.com",
    subject: "Welcome!",
    body: "Thanks for joining our platform."
  });

  // 3. Send an SMS
  await notify.sendSms({
    to: "+1234567890",
    body: "Your verification code is 1234"
  });
}

main().catch(console.error);
```

## ⚙️ Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `string` | `http://localhost:3000` | The URL of your NotifyStack API |
| `maxRetries` | `number` | `3` | Max attempts for failed requests |
| `timeoutMs` | `number` | `10000` | Request timeout duration |
| `debug` | `boolean` | `false` | Enable verbose logging |

## 📖 License

MIT © [Ayush](https://github.com/ayush462)
