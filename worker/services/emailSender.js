const config = require("../config");
const { loadProviders } = require("../providers");
const NotificationRouter = require("./notificationRouter");
const { buildHtmlEmail } = require("./emailTemplate");

// Initialize router once
let router = null;

function getRouter() {
  if (!router) {
    const providers = loadProviders(config);
    router = new NotificationRouter(providers);
  }
  return router;
}

/**
 * Send a notification through the appropriate channel.
 *
 * @param {object} data - { recipientEmail, recipientPhone, deviceToken, subject, body, eventName, channel }
 * @returns {{ messageId, provider, channel, latencyMs }}
 */
async function sendNotification(data) {
  const r = getRouter();
  const channel = data.channel || "email";

  if (channel === "email") {
    const html = buildHtmlEmail({
      subject: data.subject,
      body: data.body,
      eventName: data.eventName || null,
      recipientEmail: data.recipientEmail
    });
    return r.sendEmail({
      to: data.recipientEmail,
      subject: data.subject,
      body: data.body,
      html
    });
  }

  if (channel === "sms") {
    return r.sendSms({
      to: data.recipientPhone || data.recipientEmail, // phone number
      body: `${data.subject}: ${data.body}`
    });
  }

  if (channel === "push") {
    return r.sendPush({
      to: data.deviceToken,
      subject: data.subject,
      body: data.body,
      data: { eventName: data.eventName, notificationId: data.id }
    });
  }

  if (channel === "inapp") {
    return { provider: "internal", channel: "inapp" };
  }
 
  throw new Error(`Unknown channel: ${channel}`);
}

/**
 * Legacy compat — just email
 */
async function sendEmail(data) {
  return sendNotification({ ...data, channel: "email" });
}

module.exports = { sendNotification, sendEmail, getRouter };
