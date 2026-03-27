const { Kafka } = require("kafkajs");
const config = require("../config");
const logger = require("../utils/logger");
const { sendNotification } = require("../services/emailSender");
const { markSent, markFailed, markRetrying } = require("../services/notificationService");
const { sendToDlq, retryNotification } = require("./producer");
const { writeLog } = require("../services/logService");

/**
 * Calculate retry delay with jitter (±20%).
 * Schedule: 1m → 5m → 30m → 2h → 6h
 */
function getRetryDelay(attempt) {
  const delays = config.retryDelays || [60000, 300000, 1800000, 7200000, 21600000];
  const base = delays[Math.min(attempt - 1, delays.length - 1)];
  const jitter = base * 0.2 * (Math.random() * 2 - 1); // ±20%
  return Math.max(1000, Math.round(base + jitter));
}

async function runConsumer() {
  const kafka = new Kafka({ clientId: config.kafkaClientId, brokers: config.kafkaBrokers });
  const consumer = kafka.consumer({ groupId: config.groupId });

  await consumer.connect();
  await consumer.subscribe({ topic: config.topicNotifications, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const attempts = (payload.attempts || 0) + 1;
      const channel = payload.channel || "email";

      // Delayed retry: if scheduledAt is in the future, re-enqueue
      if (payload.scheduledAt && Date.now() < payload.scheduledAt) {
        await retryNotification(payload);
        return;
      }

      const startTime = Date.now();

      try {
        const result = await sendNotification(payload);
        const latencyMs = Date.now() - startTime;

        await markSent(payload.id, result.provider, latencyMs);

        logger.info({
          id: payload.id,
          provider: result.provider,
          channel,
          latencyMs
        }, "notification_sent");

        await writeLog({
          level: "info",
          service: "worker",
          event: "notification_sent",
          projectId: payload.projectId || null,
          metadata: {
            notificationId: payload.id,
            provider: result.provider,
            channel,
            latencyMs,
            email: payload.recipientEmail
          }
        });

      } catch (e) {
        const latencyMs = Date.now() - startTime;
        const providerErrors = e.providerErrors || [{ provider: "unknown", error: e.message }];

        if (attempts >= config.maxRetries) {
          // ── DLQ ──
          await sendToDlq({
            ...payload,
            attempts,
            error: e.message,
            providerErrors,
            failedAt: new Date().toISOString()
          });
          await markFailed(payload.id, attempts, e.message);

          logger.error({
            id: payload.id,
            error: e.message,
            attempts,
            channel,
            providerErrors
          }, "notification_sent_to_dlq");

          await writeLog({
            level: "error",
            service: "worker",
            event: "notification_failed_dlq",
            projectId: payload.projectId || null,
            metadata: {
              notificationId: payload.id,
              attempts,
              channel,
              error: e.message,
              providerErrors,
              latencyMs
            }
          });

        } else {
          // ── Retry with exponential backoff + jitter ──
          const delay = getRetryDelay(attempts);
          const scheduledAt = Date.now() + delay;

          await retryNotification({
            ...payload,
            attempts,
            scheduledAt,
            lastError: e.message
          });
          await markRetrying(payload.id, attempts, `retry_${attempts}:${e.message}`);

          logger.warn({
            id: payload.id,
            attempts,
            nextRetryMs: delay,
            channel
          }, "notification_scheduled_for_retry");

          await writeLog({
            level: "warn",
            service: "worker",
            event: "notification_retrying",
            projectId: payload.projectId || null,
            metadata: {
              notificationId: payload.id,
              attempts,
              channel,
              error: e.message,
              nextRetryMs: delay,
              scheduledAt: new Date(scheduledAt).toISOString(),
              latencyMs
            }
          });
        }
      }
    }
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info("Worker shutting down...");
    await consumer.disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

module.exports = { runConsumer };
