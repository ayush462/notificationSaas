import { useState } from "react";
import { BookOpen, Terminal, Zap, Key, Shield, Code, Layers, ServerCrash, Share2, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const sections = [
  { id: "quick-start", title: "Quick Start", icon: Layers },
  { id: "authentication", title: "Authentication", icon: Shield },
  { id: "event-system", title: "Event System", icon: Zap },
  { id: "providers", title: "Providers & Failover", icon: Share2 },
  { id: "sdk-usage", title: "SDK Usage (Node.js)", icon: Code },
  { id: "api-reference", title: "API Reference", icon: Terminal },
  { id: "webhooks-suppressions", title: "Webhooks & Suppressions", icon: Shield },
  { id: "in-app", title: "In-App Notification Center", icon: Bell },
  { id: "security", title: "API Key Security", icon: Key },
];

function QuickStart() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Quick Start (5 minutes)</h2>
        <p className="text-sm text-ink-muted">Get your first notification sent using the API.</p>
      </div>

      <div className="card border-2 border-ink">
        <ol className="list-decimal pl-5 space-y-3 text-sm text-ink-muted">
          <li><strong className="text-ink">Sign up</strong> — Create an account on the dashboard</li>
          <li><strong className="text-ink">Create a project</strong> — Go to Projects → "New Project"</li>
          <li><strong className="text-ink">Generate an API key</strong> — Go to API Keys → "Create Key" → <span className="text-red-600 font-medium">copy it immediately</span></li>
          <li><strong className="text-ink">Send your first notification</strong> — Use the curl command below:</li>
        </ol>
        <pre className="mt-4 rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`# Send a notification in 1 line
curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{"event":"USER_SIGNUP","data":{"email":"test@example.com","name":"Ayush"}}'`}
        </pre>
      </div>
    </div>
  );
}

function Authentication() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Authentication</h2>
        <p className="text-sm text-ink-muted">Secure your requests to the NotifyStack service.</p>
      </div>

      <div className="space-y-4 text-sm text-ink-muted">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card bg-surface-muted/50">
            <p className="font-semibold text-ink mb-2 flex items-center gap-2"><Key className="h-4 w-4" /> API Key (Server)</p>
            <p className="mb-3">Used by your backend to send notifications. Scoped to a single project.</p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-surface-border block">x-api-key: ntf_live_xxxxxx</code>
          </div>
          <div className="card bg-surface-muted/50">
            <p className="font-semibold text-ink mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> JWT Token (Dashboard)</p>
            <p className="mb-3">Used by the dashboard to manage projects and keys.</p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-surface-border block">Authorization: Bearer eyJhbG...</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Event System</h2>
        <p className="text-sm text-ink-muted">Create logic-free API calls. Keep templates in the dashboard.</p>
      </div>

      <div className="space-y-6 text-sm text-ink-muted">
        <div>
          <h3 className="text-base font-semibold text-ink mb-2">How it works</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create an <strong>event template</strong> (e.g. <code>USER_LOGIN</code>) with variables like <code>{"{{name}}"}</code>.</li>
            <li>Call the API with that event name and a JSON payload containing exactly those variables.</li>
            <li>The worker safely injects the data into the template and dispatches the email.</li>
          </ol>
        </div>

        <div className="card overflow-hidden !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event / Trigger Name</th>
                <th>Subject Example</th>
                <th>Variables</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="font-mono text-xs font-semibold">USER_SIGNUP</td><td>Welcome, {"{{name}}"}!</td><td className="font-mono text-[10px]">name, email</td></tr>
              <tr><td className="font-mono text-xs font-semibold">ORDER_PLACED</td><td>Order #{"{{orderId}}"} confirmed</td><td className="font-mono text-[10px]">name, orderId, total</td></tr>
              <tr><td className="font-mono text-xs font-semibold">PASSWORD_RESET</td><td>Password reset</td><td className="font-mono text-[10px]">email, resetLink</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-base font-semibold text-ink mb-2">Code Example</h3>
          <p className="mb-2">Once you create a `USER_SIGNUP` template in the Dashboard, you trigger it from your backend code like this:</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`// Using the Node.js SDK
await notify.send({
  event: "USER_SIGNUP",
  data: {
    name: "Ayush",
    email: "ayush@example.com"
  }
});

// Or using Raw cURL
curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications \\
  -H "x-api-key: <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"USER_SIGNUP", "data":{"name":"Ayush", "email":"ayush@example.com"}}'`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ProvidersFailover() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2 flex items-center gap-2">Built-in Failover Routing <Zap className="h-5 w-5 text-amber-500" /></h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          The core advantage of NotifyStack is that <strong>you don't need to configure your own email or SMS providers</strong>. You send us a single API request, and we handle the complexity of multi-channel global delivery.
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink-muted">
        <div className="card bg-amber-50/50 border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2"><ServerCrash className="h-4 w-4" /> Global Circuit Breaker</h3>
          <p className="text-amber-800 leading-relaxed mb-3">
            If a primary node (like SendGrid) experiences an outage or yields a 5xx timeout, our system automatically <strong>skips the failing node</strong> for 60 seconds (Circuit Opened) and instantly shifts your traffic to fallback nodes (like Mailgun or external SMTP clusters) <strong>without dropping your request</strong>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card border border-surface-border">
            <h3 className="font-semibold text-ink mb-2">Email Routing</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              We maintain active, load-balanced connections to enterprise-grade SendGrid and Mailgun clusters. You do not need to bring your own API keys. You simply use your <code>ntf_live_YOUR_KEY</code> and we guarantee delivery.
            </p>
          </div>
          <div className="card border border-surface-border">
            <h3 className="font-semibold text-ink mb-2">SMS Routing</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              SMS messages are natively routed through Twilio's global infrastructure. Our engine automatically formats the numbers and handles carrier-specific rate limiting on your behalf.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-ink mb-2">How to test locally safely?</h3>
          <p className="mb-2">If you are testing your application locally and don't want to accidentally send real emails to your customers, simply use the <strong>Test Environment Key</strong> (coming soon) or use a local mock destination in your API request.</p>
        </div>
      </div>
    </div>
  );
}

function SdkUsage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">SDK Usage</h2>
        <p className="text-sm text-ink-muted">Using the official Node.js SDK for maximum type safety.</p>
      </div>

      <div className="space-y-4">
        <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`npm install notify-saas-sdk`}
        </pre>
        <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`const NotifySDK = require("notify-saas-sdk");

// Init (Zero-Config: defaults to https://api.notifystack.shop)
const notify = new NotifySDK(process.env.NOTIFY_API_KEY);

// 1. Event-based Email (Routed to SendGrid & Mailgun automatically)
await notify.track("ORDER_PLACED", {
  email: "buyer@example.com",
  orderId: "#10928",
  total: "$49.99"
});

// 2. Direct Email via SendGrid or Mailgun (Handles failover natively)
await notify.send({
  to: "buyer@example.com",
  subject: "Shipping Update",
  body: "Your package #10928 has shipped via UPS."
});

// 3. SMS via Twilio (Requires Twilio config in worker backend)
await notify.sendSms({
  to: "+1234567890",
  body: "Your validation code is: 123456"
});`}
        </pre>
      </div>
    </div>
  );
}

function ApiReference() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">API Reference</h2>
        <p className="text-sm text-ink-muted">Raw REST access via cURL.</p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">1. Send Event (Routed to SendGrid/Mailgun)</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -H "x-idempotency-key: unique-request-123" \\
  -d '{
    "event": "USER_LOGIN",
    "data": { "email": "user@test.com", "name": "Ayush" }
  }'`}
          </pre>
        </div>
        
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">2. Direct Email (SendGrid/Mailgun with Failover)</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{
    "recipientEmail": "user@test.com",
    "subject": "System Alert",
    "body": "Your servers are down."
  }'`}
          </pre>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">3. Direct SMS (Routed to Twilio)</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{
    "recipientPhone": "+1234567890",
    "body": "Your login code is 123456"
  }'`}
          </pre>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Retry Failed Notification</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications/dlq/ntf_abc123/requeue \\
  -H "x-api-key: ntf_live_YOUR_KEY"`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function InAppNotification() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">In-App Notification Center</h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          The In-App Notification Center allows you to display a real-time notification feed directly in your web application. 
          Unlike Email or SMS, In-App notifications are delivered to a database-backed feed which your frontend can consume via our SDK.
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink-muted">
        <div>
          <h3 className="text-base font-semibold text-ink mb-3">1. Enable In-App Notifications</h3>
          <p className="mb-3">
            To send an in-app notification, set the <code>channel</code> to <code>"inapp"</code> and provide an <code>externalUserId</code>. 
            This ID should correspond to the unique user ID in your own system.
          </p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-blue-400 overflow-x-auto">
{`curl -X POST ${import.meta.env.VITE_API_URL || 'https://api.notifystack.shop'}/v1/notifications \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{
    "channel": "inapp",
    "externalUserId": "user_123",
    "subject": "New Message",
    "body": "You have a new direct message from Sarah."
  }'`}
          </pre>
        </div>

        <div>
          <h3 className="text-base font-semibold text-ink mb-3">2. Frontend Integration (React)</h3>
          <p className="mb-3">
            Use our <code>NotificationBell</code> component to add a live, interactive bell to your navbar. 
            It handles polling, unread counts, and marking items as read automatically.
          </p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-blue-400 overflow-x-auto">
{`import { NotificationBell } from "@notifystack/react";

function Layout({ user }) {
  return (
    <nav>
      <Logo />
      <NotificationBell 
        apiKey="ntf_live_xxxx" // Public Prefixed Keys are safe for frontend
        externalUserId={user.id} 
      />
    </nav>
  );
}`}
          </pre>
        </div>

        <div className="card bg-blue-50/50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
            <Layers className="h-4 w-4" /> Live Playground
          </h4>
          <p className="text-blue-800 text-xs">
            Want to see it in action? Head over to the **In-App Playground** tab in your dashboard to test triggering and viewing notifications in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}

function Security() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Security Guidelines</h2>
      </div>
      <ul className="list-disc pl-5 space-y-3 text-sm text-ink-muted">
        <li>Keys are shown <strong className="text-red-600">only once</strong> at creation — save them to your ENV immediately.</li>
        <li>System only stores SHA-256 hashes of your keys, making it impossible for DB leaks to compromise your active integrations.</li>
        <li>Rate limiting: <strong>120 requests/minute</strong> per API key to prevent spam overages.</li>
        <li>Include <code className="bg-surface-muted px-1 rounded">x-idempotency-key</code> in POST headers to permanently prevent duplicate charging and double-sends on retries.</li>
      </ul>
    </div>
  );
}

function WebhooksSuppressions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Webhooks & Suppressions</h2>
        <p className="text-sm text-ink-muted">Manage your email deliverability and real-time events.</p>
      </div>

      <div className="space-y-8 text-sm text-ink-muted">
        <div>
          <h3 className="text-lg font-bold text-ink mb-2">What is a Webhook?</h3>
          <p className="mb-3">
            Webhooks allow NotifyStack to ping **your backend server** the exact second an event happens. 
            For example, if you send an email and it successfully lands in the user's inbox, or if an SMS fails to send because of a bad number, we will make a <code>POST</code> request to your webhook URL.
          </p>
          <p className="mb-3">
            You can manage these endpoints in the **Webhooks** tab. All webhook payloads are signed with an HMAC `NotifyStack-Signature` header so you can verify they came from us.
          </p>
        </div>

        <div>
           <h3 className="text-lg font-bold text-ink mb-2">What is the Suppression List?</h3>
           <p className="mb-3">
             To protect your SendGrid/Twilio sender reputation, you must NOT continuously send messages to dead or bounced addresses.
           </p>
           <p className="mb-3">
             The **Suppressions List** ensures that if an email address bounces, or if a user clicks the **Unsubscribe** link at the bottom of an email, we will permanently block all future outgoing notifications to that email address. You can view or manually add blocks in the **Suppressions** tab.
           </p>
        </div>
      </div>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState("quick-start");

  const views = {
    "quick-start": QuickStart,
    "authentication": Authentication,
    "event-system": EventSystem,
    "providers": ProvidersFailover,
    "sdk-usage": SdkUsage,
    "api-reference": ApiReference,
    "webhooks-suppressions": WebhooksSuppressions,
    "in-app": InAppNotification,
    "security": Security
  };

  const ActiveComponent = views[active];

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-6 h-fit bg-white/50 md:bg-transparent rounded-2xl md:rounded-none border border-surface-border md:border-none p-4 md:p-0">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">Documentation</h2>
        </div>
        <nav className="space-y-1">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActive(sec.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                active === sec.id
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              )}
            >
              <sec.icon className={cn("h-4 w-4 shrink-0", active === sec.id ? "text-white" : "text-ink-subtle")} />
              {sec.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-white rounded-2xl border border-surface-border p-6 md:p-10 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
