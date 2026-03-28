const Redis = require("ioredis");
const config = require("../config");

const redisClient = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

module.exports = redisClient;
