require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const auditLogger = require("./middleware/auditLogger");
const correlationId = require("./middleware/correlationId");

// Routes
const authRoutes = require("./routes/authRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const projectRoutes = require("./routes/projectRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const inappRoutes = require("./routes/inappRoutes");
const logRoutes = require("./routes/logRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const billingRoutes = require("./routes/billingRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const projectWebhookRoutes = require("./routes/projectWebhookRoutes");
const suppressionRoutes = require("./routes/suppressionRoutes");
const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Webhook routes need raw body — mount BEFORE json parser
app.use("/v1/webhooks", webhookRoutes);

app.use(express.json({ limit: "1mb" }));

// Request tracing
app.use(correlationId);
app.use(requestLogger);
app.use(auditLogger);

// Health check
app.get("/health", (req, res) => res.json({
  ok: true,
  service: "notifystack-api",
  version: "2.0.0",
  timestamp: new Date().toISOString(),
  environment: config.nodeEnv
}));

// Public config (for frontend)
app.get("/v1/config", (req, res) => res.json({
  googleClientId: config.googleClientId || null,
  razorpayKeyId: config.razorpayKeyId || null,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
  features: {
    google: !!config.googleClientId,
    razorpay: !!config.razorpayKeyId,
    sms: !!process.env.TWILIO_ACCOUNT_SID,
    push: !!(process.env.FCM_SERVICE_ACCOUNT || process.env.VAPID_PUBLIC_KEY)
  }
}));

// Auth (public)
app.use("/v1/auth", authRoutes);
app.use("/v1/auth", oauthRoutes);

// API keys & events (nested under projects, JWT)
app.use("/v1/projects/:projectId/keys", apiKeyRoutes);
app.use("/v1/projects/:projectId/events", eventRoutes);
app.use("/v1/projects/:projectId/webhooks", projectWebhookRoutes);
app.use("/v1/projects/:projectId/suppressions", suppressionRoutes);

// Projects (JWT) — general routes must be below specialized ones
app.use("/v1/projects", projectRoutes);

// Notifications (API key auth — for SDK)
app.use("/v1/notifications", notificationRoutes);
app.use("/v1/inapp", inappRoutes);

// Dashboard routes (JWT)
app.use("/v1/dashboard/notifications", dashboardRoutes);
app.use("/v1/dashboard/logs", logRoutes);

// Analytics (JWT)
app.use("/v1/analytics", analyticsRoutes);

// Billing (JWT)
app.use("/v1/billing", billingRoutes);

// Admin routes (JWT + ADMIN role)
app.use("/v1/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use(errorHandler);

const { runMigrations } = require("./services/migrationService");

runMigrations().then(() => {
  app.listen(config.port, () => {
    console.log(`NotifyStack API v2.0 listening on port ${config.port} [${config.nodeEnv}]`);
  });
}).catch((err) => {
  console.error("Failed to start API due to migration error.", err);
  process.exit(1);
});
