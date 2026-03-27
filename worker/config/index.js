require("dotenv").config();

module.exports = {
  dbUrl: process.env.DATABASE_URL,
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
    from: process.env.SMTP_FROM || "noreply@example.com"
  },
  maxRetries: Number(process.env.MAX_RETRIES || 3)
};
