# NotifyStack SDK Guide

The NotifyStack Node.js SDK makes it incredibly simple to orchestrate multi-channel messaging.

A core feature of the platform is that you **DO NOT** need to write provider-specific logic in your codebase. You simply set your provider credentials (like Twilio, SendGrid, or Mailgun) in the `.env` file of the `worker`, and the backend handles all routing, circuit-breaking, and failovers!

### Initialization

```javascript
const NotifySDK = require("notifystack-client");

const notify = new NotifySDK("ntf_live_YOUR_API_KEY", {
  baseUrl: "http://localhost:3000",
  debug: true
});
```

---

## Code Snippets: Using Providers

> [!TIP]
> The beauty of NotifyStack is that the backend parses the `channel: "email"` flag. If `SMTP` fails, it automatically falls back to `SendGrid`, then to `Mailgun` based on the worker configuration.

### 1. Sending Email (SendGrid / Mailgun / SMTP)

When you send an email via the SDK, the worker will automatically pipe it to whatever email provider you have active! We strongly recommend setting up **SendGrid** or **Mailgun** API keys for robust production deliverability.

```javascript
// This magically uses SendGrid, Mailgun, or SMTP under the hood!
await notify.send({
  channel: "email",
  to: "user@example.com",
  subject: "Welcome to our SaaS!",
  body: "Thank you for signing up. Please verify your email.",
});

// There is also a helper shorthand specifically for email:
await notify.sendEmail({
  to: "user@example.com",
  subject: "Alert",
  body: "Critical threshold reached"
});
```

### 2. Sending SMS (Twilio)

Configure `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in the worker. Then simply pass `channel: "sms"`!

```javascript
// This tells the worker to use the configured Twilio provider!
await notify.send({
  channel: "sms",
  to: "+1234567890",
  subject: "Auth", // Not used in typical SMS, but needed for schema
  body: "Your NotifyStack verification code is: 4892",
});

// Shorthand method:
await notify.sendSms({
  to: "+1234567890",
  body: "Your login OTP is 5543"
});
```

### 3. Firing Pre-Defined Events

Instead of writing templates in code, you can build them in the dashboard and fire them:

```javascript
// Triggers the "USER_SIGNUP" flow and dynamically populates 
// the email/SMS template with the `name` and `tier` payload.
await notify.track("USER_SIGNUP", {
  email: "newuser@example.com",
  name: "Jane Doe",
  tier: "Premium"
});
```

### 4. Delayed / Scheduled Notifications (NEW)

You can pass a `scheduledAt` ISO timestamp to delay send:

```javascript
// Send a reminder email tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

await notify.sendEmail({
  to: "trial@example.com",
  subject: "How is your trial?",
  body: "Let us know if you need help getting set up!",
  scheduledAt: tomorrow.toISOString()
});
```

For full Node API references, see `index.js`.

---

## 5. In-App Notification Center (React)

You can embed a beautiful, real-time notification bell directly inside your React/Next SaaS application. This allows your users to see the history of notifications sent to them!

1. **Send a Notification tagged with a `userId`:**
```javascript
// Server-side
await notify.send({
  channel: "inapp",
  externalUserId: "user_8912", // Your internal user ID
  subject: "New Comment",
  body: "Someone replied to your thread."
});
```

2. **Embed the Bell in your Frontend:**
```javascript
import { NotificationBell } from "notifystack-client/react";

function Header() {
  return (
    <header>
      <h1>My SaaS</h1>
      {/* Drop in the bell component! */}
      <NotificationBell 
        apiKey="ntf_live_YOUR_PUBLIC_KEY" 
        userId="user_8912" 
        baseUrl="http://localhost:3000" 
      />
    </header>
  );
}
```
*Note: Make sure to use a key created with standard frontend scope if implementing row-level security, or proxy through your backend!*
