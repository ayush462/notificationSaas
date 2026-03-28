const redisClient = require("./client");
const { retryNotification } = require("../kafka/producer");
const logger = require("../utils/logger");

const DELAY_QUEUE_KEY = "notification_delay_queue";

/**
 * Schedule a notification for delayed retry/processing.
 * @param {object} payload 
 */
async function scheduleDelayedNotification(payload) {
  const processAt = payload.scheduledAt || Date.now();
  await redisClient.zadd(DELAY_QUEUE_KEY, processAt, JSON.stringify(payload));
}

/**
 * Poll for scheduled notifications that are ready to process.
 */
async function pollDelayedNotifications() {
  const now = Date.now();
  // Get all items up to 'now'
  const items = await redisClient.zrangebyscore(DELAY_QUEUE_KEY, "-inf", now);

  if (items.length > 0) {
    // Remove processed items
    await redisClient.zremrangebyscore(DELAY_QUEUE_KEY, "-inf", now);

    for (const item of items) {
      try {
        const payload = JSON.parse(item);
        // Clear scheduledAt so it processes immediately on next consume
        payload.scheduledAt = null; 
        await retryNotification(payload);
      } catch (e) {
        logger.error({ error: e.message }, "error_processing_delayed_item");
      }
    }
  }
}

let pollingInterval;

function startDelayQueuePoller() {
  pollingInterval = setInterval(pollDelayedNotifications, 5000);
}

function stopDelayQueuePoller() {
  if (pollingInterval) clearInterval(pollingInterval);
}

module.exports = { scheduleDelayedNotification, startDelayQueuePoller, stopDelayQueuePoller };
