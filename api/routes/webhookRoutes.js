const express = require("express");
const crypto = require("crypto");
const router = express.Router();

// Razorpay webhook — must use raw body or parse properly
// Razorpay signature is sent in 'x-razorpay-signature' header. The payload is the raw string body.
router.post("/razorpay", express.raw({ type: "application/json" }), async (req, res) => {
  const config = require("../config");
  const billingService = require("../services/billingService");
  const logService = require("../services/logService");

  try {
    const rawBody = req.body.toString();
    const signature = req.headers["x-razorpay-signature"];

    if (config.razorpayWebhookSecret) {
      if (!signature) {
        return res.status(400).json({ error: "Missing Razorpay signature" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", config.razorpayWebhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).json({ error: "Invalid Razorpay signature" });
      }
    }

    const event = JSON.parse(rawBody);

    await billingService.handleWebhookEvent(event);

    await logService.writeLog({
      level: "info",
      service: "api",
      event: `razorpay_webhook_${event.event}`,
      metadata: { eventId: event.account_id, type: event.event }
    }).catch(() => {});

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
