# 📦 @ayush0x44/notifystack

The official Node.js SDK for **NotifyStack** — a scalable, production-grade notification SaaS platform.

[![NPM Version](https://img.shields.io/npm/v/@ayush0x44/notifystack?color=blue&style=flat-square)](https://www.npmjs.com/package/@ayush0x44/notifystack)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## 🚀 Installation

```bash
npm install @ayush0x44/notifystack
```

---

## 🔥 Features
- **Zero-Config:** Automatically points to the production `api.notifystack.shop` domain.
- **Smart Retries:** Automatic exponential backoff for failed requests.
- **Idempotency:** Native support for `x-idempotency-key` to prevent duplicate sends.
- **Multi-Channel:** Full support for Email, SMS, and Push notifications from a single client.
- **Health Checks:** Built-in methods to verify API connectivity.

---

## 🛠️ Usage

### ⚙️ 1. Initialization
```javascript
const { NotifySDK } = require("@ayush0x44/notifystack");

// Create your client (Zero-Config: no baseUrl required!)
const sdk = new NotifySDK("ntf_live_xxxx_your_api_key");
```

### 🎯 2. Event-Based Notification (Recommended)
Map your backend events to visual templates created in the NotifyStack Dashboard.

```javascript
await sdk.track("USER_WELCOME", {
  email: "user@example.com",
  name: "Ayush",
  plan: "Pro"
});
```

### ✉️ 3. Direct Email
Send raw email content without a template.

```javascript
await sdk.send({
  to: "user@example.com",
  subject: "Security Alert",
  body: "Wait! Was this you logging in?"
});
```

### 📱 4. Direct SMS
Send SMS via Twilio (requires configuration in your NotifyStack dashboard).

```javascript
await sdk.sendSms({
  to: "+1234567890",
  body: "Your verification code is: 123456"
});
```

### 🏥 5. Health Check
Verify your connection to the NotifyStack cloud.

```javascript
const status = await sdk.health();
console.log(status.ok); // true
```

---

## 🛡️ Error Handling
NotifyStack uses a custom error class for precise debugging.

```javascript
const { NotifyError } = require("@ayush0x44/notifystack");

try {
  await sdk.send({ ... });
} catch (e) {
  if (e instanceof NotifyError) {
    console.error(`Status ${e.status}:`, e.message);
  }
}
```

---

## 🔗 Resources
- **Live Dashboard:** [notifystack.shop](https://notifystack.shop)
- **API Documentation:** [notifystack.shop/docs](https://notifystack.shop/docs)

MIT © **Ayush**
