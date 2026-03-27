require("dotenv").config();

module.exports = {
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "notification-worker",
  topicNotifications: process.env.KAFKA_TOPIC_NOTIFICATIONS || "email_queue",
  topicDlq: process.env.KAFKA_TOPIC_DLQ || "email_dlq",
  groupId: process.env.KAFKA_GROUP_ID || "email-worker-group",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@example.com",
    dkim: process.env.DKIM_PRIVATE_KEY ? {
      domain: process.env.DKIM_DOMAIN,
      selector: process.env.DKIM_SELECTOR || "default",
      privateKey: process.env.DKIM_PRIVATE_KEY
    } : null
  },
  maxRetries: Number(process.env.MAX_RETRIES || 5),
  // Retry backoff schedule in ms: 1m, 5m, 30m, 2h, 6h
  retryDelays: [60000, 300000, 1800000, 7200000, 21600000]
};
