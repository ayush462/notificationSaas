import { BookOpen, Terminal, Zap, Key, Shield, Code, Layers } from "lucide-react";

export default function Docs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Documentation</h1>
        <p className="mt-1 text-sm text-ink-muted">Complete API reference, SDK guide, and event system walkthrough.</p>
      </div>

      {/* Quick Start */}
      <section className="card border-2 border-ink">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-ink" />
          <h2 className="text-lg font-semibold">Quick Start (5 minutes)</h2>
        </div>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-ink-muted">
          <li><strong className="text-ink">Sign up</strong> — Create an account on the dashboard</li>
          <li><strong className="text-ink">Create a project</strong> — Go to Projects → "New Project"</li>
          <li><strong className="text-ink">Generate an API key</strong> — Go to API Keys → "Create Key" → <span className="text-red-600 font-medium">copy it immediately (shown once!)</span></li>
          <li><strong className="text-ink">Send your first notification</strong> — Use the SDK or curl below</li>
        </ol>
        <pre className="mt-4 rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`# Send a notification in 1 line
curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{"event":"USER_SIGNUP","data":{"email":"test@example.com","name":"Ayush"}}'`}
        </pre>
      </section>

      {/* Auth */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">Authentication</h2>
        </div>
        <div className="space-y-3 text-sm text-ink-muted">
          <p>Two authentication methods:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-surface-border bg-surface-muted p-4">
              <p className="font-semibold text-ink mb-1">🔑 API Key (for SDK / server-to-server)</p>
              <code className="text-xs bg-white px-2 py-0.5 rounded border border-surface-border block mt-2">x-api-key: ntf_live_xxxxxxxxxxxxxxxx</code>
              <p className="text-xs mt-2">Used by your backend to send notifications. Scoped to a single project.</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-surface-muted p-4">
              <p className="font-semibold text-ink mb-1">🎫 JWT Token (for dashboard)</p>
              <code className="text-xs bg-white px-2 py-0.5 rounded border border-surface-border block mt-2">Authorization: Bearer eyJhbGc...</code>
              <p className="text-xs mt-2">Obtained via login. Used by the dashboard to manage projects, keys, and view data.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Sign Up</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Ayush","email":"ayush@example.com","password":"securepass123"}'

# Response:
# { "success": true, "data": { "user": {...}, "token": "eyJ..." } }`}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Login</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"ayush@example.com","password":"securepass123"}'`}
            </pre>
          </div>
        </div>
      </section>

      {/* Event System — detailed */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Event System (Detailed Guide)</h2>
        </div>

        <div className="space-y-5 text-sm text-ink-muted">
          <div>
            <h3 className="font-semibold text-ink mb-2">How it works</h3>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>You create an <strong>event template</strong> (e.g. <code className="text-xs bg-surface-muted px-1 rounded">USER_LOGIN</code>) with a subject & body containing <code className="text-xs bg-surface-muted px-1 rounded">{"{{variables}}"}</code></li>
              <li>When you call the API with that event name + data, the system <strong>resolves</strong> the template by replacing variables</li>
              <li>The resolved email is queued in Kafka and sent by the worker</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-ink mb-2">Predefined Templates</h3>
            <p className="mb-3">These are auto-created when you create a project. You can edit them.</p>
            <div className="rounded-lg border border-surface-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Subject Template</th>
                    <th>Variables Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-xs font-semibold">USER_LOGIN</td>
                    <td className="text-xs">New login detected for {"{{name}}"}</td>
                    <td className="text-xs"><code>name</code>, <code>email</code>, <code>time</code></td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-semibold">USER_SIGNUP</td>
                    <td className="text-xs">Welcome to the platform, {"{{name}}"}!</td>
                    <td className="text-xs"><code>name</code>, <code>email</code></td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-semibold">ORDER_PLACED</td>
                    <td className="text-xs">Order #{"{{orderId}}"} confirmed</td>
                    <td className="text-xs"><code>name</code>, <code>orderId</code>, <code>total</code></td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-semibold">PASSWORD_RESET</td>
                    <td className="text-xs">Password reset requested</td>
                    <td className="text-xs"><code>name</code>, <code>email</code>, <code>resetLink</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink mb-2">Creating a Custom Template</h3>
            <p className="mb-2">Example: You want to notify users when their subscription renews.</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`# 1. Create the template (JWT required)
curl -X POST http://localhost:3000/v1/projects/YOUR_PROJECT_ID/events \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -d '{
    "eventName": "SUBSCRIPTION_RENEWED",
    "subjectTemplate": "Your {{planName}} subscription renewed!",
    "bodyTemplate": "Hi {{name}},\\n\\nYour {{planName}} plan was renewed successfully.\\nAmount: {{amount}}\\nNext renewal: {{nextDate}}\\n\\nThanks for being with us!"
  }'

# 2. Now trigger it from your backend (API key)
curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{
    "event": "SUBSCRIPTION_RENEWED",
    "data": {
      "email": "customer@example.com",
      "name": "Ayush",
      "planName": "Pro",
      "amount": "$29/mo",
      "nextDate": "2025-02-01"
    }
  }'

# Result: Email sent to customer@example.com
# Subject: "Your Pro subscription renewed!"
# Body: "Hi Ayush, Your Pro plan was renewed successfully..."
`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-ink mb-2">Real-world use cases</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { event: "PAYMENT_FAILED", desc: "Alert user about failed payment", vars: "name, email, amount, retryDate" },
                { event: "INVITE_ACCEPTED", desc: "Notify team owner about new member", vars: "inviterName, memberName, teamName" },
                { event: "REPORT_READY", desc: "Weekly analytics report is ready", vars: "name, email, reportUrl, period" },
                { event: "ACCOUNT_SUSPENDED", desc: "Account suspension warning", vars: "name, email, reason, appealLink" },
                { event: "SHIPPING_UPDATE", desc: "Order shipping status change", vars: "name, orderId, status, trackingUrl" },
                { event: "TWO_FACTOR_CODE", desc: "2FA verification code", vars: "name, code, expiresIn" }
              ].map((uc) => (
                <div key={uc.event} className="rounded-lg border border-surface-border p-3">
                  <p className="font-mono text-xs font-semibold text-ink">{uc.event}</p>
                  <p className="text-xs text-ink-muted mt-1">{uc.desc}</p>
                  <p className="text-[10px] text-ink-subtle mt-1.5">Variables: <code>{uc.vars}</code></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* API Usage */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">API Reference</h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Send Event-Based Notification</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -H "x-idempotency-key: unique-request-id-123" \\
  -d '{
    "event": "USER_LOGIN",
    "data": {
      "email": "user@example.com",
      "name": "Ayush",
      "time": "2025-01-15T10:30:00Z"
    }
  }'

# Response (202 Accepted):
# { "success": true, "data": { "id": "ntf_abc123...", "status": "queued" } }`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Send Direct Email (No Template)</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{
    "recipientEmail": "user@example.com",
    "subject": "Important: Security Alert",
    "body": "We detected unusual activity on your account."
  }'`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">List Notifications</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl http://localhost:3000/v1/notifications?limit=20&status=sent \\
  -H "x-api-key: ntf_live_YOUR_KEY"

# Filter options: status=queued|sent|failed|retrying`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Retry Failed Notification</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications/dlq/ntf_abc123/requeue \\
  -H "x-api-key: ntf_live_YOUR_KEY"`}
            </pre>
          </div>
        </div>
      </section>

      {/* SDK */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">SDK Usage (Node.js)</h2>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Installation</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`npm install ./sdk   # install from local sdk/ directory`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Complete Example</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`const NotifySDK = require("notify-saas-sdk");

// Initialize with your API key
const notify = new NotifySDK("ntf_live_your_key_here", {
  baseUrl: "http://localhost:3000",  // your API URL
  maxRetries: 3,                     // auto-retry on failure
  timeoutMs: 10000                   // 10s timeout
});

// ✅ Event-based notification (uses templates)
await notify.track("USER_LOGIN", {
  email: "user@example.com",      // REQUIRED — recipient
  name: "Ayush",                  // template variable
  time: new Date().toISOString()  // template variable
});

// ✅ Direct email (no template needed)
await notify.send({
  to: "user@example.com",
  subject: "Your invoice is ready",
  body: "Hi Ayush, your invoice #1234 is attached."
});

// ✅ List recent notifications
const result = await notify.listNotifications({
  limit: 10,
  status: "sent"
});
console.log(result);`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Express.js Integration Example</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`const express = require("express");
const NotifySDK = require("notify-saas-sdk");
const app = express();

const notify = new NotifySDK(process.env.NOTIFY_API_KEY);

// Send welcome email on signup
app.post("/signup", async (req, res) => {
  const user = await createUser(req.body);

  // Fire-and-forget notification
  notify.track("USER_SIGNUP", {
    email: user.email,
    name: user.name
  }).catch(console.error);

  res.json({ success: true, user });
});

// Send login alert
app.post("/login", async (req, res) => {
  const user = await authenticateUser(req.body);

  notify.track("USER_LOGIN", {
    email: user.email,
    name: user.name,
    time: new Date().toISOString()
  }).catch(console.error);

  res.json({ success: true, token: generateJWT(user) });
});`}
            </pre>
          </div>
        </div>
      </section>

      {/* API Key Security */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">API Key Security</h2>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-ink-muted">
          <li>Keys format: <code className="text-xs bg-surface-muted px-1 rounded">ntf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code></li>
          <li>Keys are shown <strong className="text-red-600">only once</strong> at creation — save immediately</li>
          <li>Only the SHA-256 hash is stored in the database — no plaintext</li>
          <li>Use <strong>Regenerate</strong> to rotate keys (old key is revoked instantly)</li>
          <li>Rate limiting: <strong>120 requests/minute</strong> per API key (configurable)</li>
          <li>Idempotency: send <code className="text-xs bg-surface-muted px-1 rounded">x-idempotency-key</code> header to prevent duplicates</li>
          <li>Never commit keys to git — use environment variables</li>
        </ul>
      </section>
    </div>
  );
}
