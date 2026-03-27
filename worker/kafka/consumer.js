const { Kafka } = require("kafkajs");
const config = require("../config");
const logger = require("../utils/logger");
const { sendEmail } = require("../services/emailSender");
const { markSent, markFailed, markRetrying } = require("../services/notificationService");
const { sendToDlq, retryNotification } = require("./producer");
const { writeLog } = require("../services/logService");

async function runConsumer() {
  const kafka = new Kafka({ clientId: config.kafkaClientId, brokers: config.kafkaBrokers });
  const consumer = kafka.consumer({ groupId: config.groupId });

  await consumer.connect();
  await consumer.subscribe({ topic: config.topicNotifications, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const attempts = (payload.attempts || 0) + 1;
      try {
        await sendEmail(payload);
        await markSent(payload.id);
        logger.info({ id: payload.id }, "email_sent");
        await writeLog("info", "email_sent", { notificationId: payload.id });
      } catch (e) {
        if (attempts >= config.maxRetries) {
          await sendToDlq({ ...payload, attempts, error: e.message });
          await markFailed(payload.id, attempts, e.message);
          logger.error({ id: payload.id, err: e.message }, "sent_to_dlq");
          await writeLog("error", "sent_to_dlq", { notificationId: payload.id, attempts, error: e.message });
        } else {
          await retryNotification({ ...payload, attempts });
          await markRetrying(payload.id, attempts, `retrying:${e.message}`);
          logger.warn({ id: payload.id, attempts }, "email_requeued_for_retry");
          await writeLog("warn", "email_requeued_for_retry", { notificationId: payload.id, attempts, error: e.message });
        }
      }
    }
  });
}

module.exports = { runConsumer };
