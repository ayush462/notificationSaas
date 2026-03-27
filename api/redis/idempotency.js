const redis = require("./client");

async function ensureIdempotent(idempotencyKey, ttlSec = 600) {
  if (!idempotencyKey) return true;
  const ok = await redis.set(`idem:${idempotencyKey}`, "1", "EX", ttlSec, "NX");
  return ok === "OK";
}

module.exports = { ensureIdempotent };
