require("dotenv").config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "notification-api",
  topicNotifications: process.env.KAFKA_TOPIC_NOTIFICATIONS || "email_queue",
  topicDlq: process.env.KAFKA_TOPIC_DLQ || "email_dlq",
  rateLimitWindowSec: Number(process.env.RATE_LIMIT_WINDOW_SEC || 60),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 120)
};

module.exports = config;
