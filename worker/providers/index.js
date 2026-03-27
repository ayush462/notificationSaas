/**
 * Provider Factory — instantiates providers from environment config.
 * All providers are optional. Only configured ones are loaded.
 */
const logger = require("../utils/logger");

function loadProviders(config) {
  const providers = { email: [], sms: [], push: [] };

  // ── Email Providers ──
  if (config.smtp && config.smtp.host) {
    try {
      const SmtpProvider = require("./smtp");
      providers.email.push({
        instance: new SmtpProvider(config.smtp),
        weight: Number(process.env.SMTP_WEIGHT || 50),
        name: "smtp"
      });
      logger.info("Loaded provider: SMTP");
    } catch (e) { logger.warn({ err: e.message }, "Failed to load SMTP provider"); }
  }

  if (process.env.SENDGRID_API_KEY) {
    try {
      const SendGridProvider = require("./sendgrid");
      providers.email.push({
        instance: new SendGridProvider({
          apiKey: process.env.SENDGRID_API_KEY,
          from: process.env.SENDGRID_FROM || config.smtp?.from || "noreply@example.com"
        }),
        weight: Number(process.env.SENDGRID_WEIGHT || 30),
        name: "sendgrid"
      });
      logger.info("Loaded provider: SendGrid");
    } catch (e) { logger.warn({ err: e.message }, "Failed to load SendGrid provider"); }
  }

  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    try {
      const MailgunProvider = require("./mailgun");
      providers.email.push({
        instance: new MailgunProvider({
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
          from: process.env.MAILGUN_FROM || `noreply@${process.env.MAILGUN_DOMAIN}`
        }),
        weight: Number(process.env.MAILGUN_WEIGHT || 20),
        name: "mailgun"
      });
      logger.info("Loaded provider: Mailgun");
    } catch (e) { logger.warn({ err: e.message }, "Failed to load Mailgun provider"); }
  }

  // ── SMS Providers ──
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const TwilioProvider = require("./twilio");
      providers.sms.push({
        instance: new TwilioProvider({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          from: process.env.TWILIO_FROM_NUMBER
        }),
        weight: 100,
        name: "twilio"
      });
      logger.info("Loaded provider: Twilio SMS");
    } catch (e) { logger.warn({ err: e.message }, "Failed to load Twilio provider"); }
  }

  // ── Push Providers ──
  if (process.env.FCM_SERVICE_ACCOUNT) {
    try {
      const FcmProvider = require("./fcm");
      providers.push.push({
        instance: new FcmProvider({
          serviceAccount: process.env.FCM_SERVICE_ACCOUNT
        }),
        weight: 70,
        name: "fcm"
      });
      logger.info("Loaded provider: Firebase FCM");
    } catch (e) { logger.warn({ err: e.message }, "Failed to load FCM provider"); }
  }

  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
      const WebPushProvider = require("./webpush");
      providers.push.push({
        instance: new WebPushProvider({
          publicKey: process.env.VAPID_PUBLIC_KEY,
          privateKey: process.env.VAPID_PRIVATE_KEY,
          subject: process.env.VAPID_SUBJECT || "mailto:admin@example.com"
        }),
        weight: 30,
        name: "webpush"
      });
      logger.info("Loaded provider: Web Push (VAPID)");
    } catch (e) { logger.warn({ err: e.message }, "Failed to load WebPush provider"); }
  }

  return providers;
}

module.exports = { loadProviders };
