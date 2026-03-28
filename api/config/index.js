module.exports = {
  port: Number(process.env.PORT || 3000),
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  jwtSecret: process.env.JWT_SECRET || "notifystack-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  topicNotifications: process.env.KAFKA_TOPIC_NOTIFICATIONS || "email_queue",
  topicDlq: process.env.KAFKA_TOPIC_DLQ || "email_dlq",
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "notifystack-api",
  kafkaSsl: process.env.KAFKA_SSL === "true",
  kafkaSasl: process.env.KAFKA_SASL_USERNAME ? {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD,
  } : null,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 120),
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW || 60),
  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || null,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
  // Environment
  nodeEnv: process.env.NODE_ENV || "development"
};
