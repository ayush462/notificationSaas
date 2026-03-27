const redis = require("./client");
const config = require("../config");

async function checkRateLimit(keyId) {
  const key = `rl:${keyId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, config.rateLimitWindowSec);
  return { allowed: count <= config.rateLimitMax, remaining: Math.max(0, config.rateLimitMax - count) };
}

module.exports = { checkRateLimit };
