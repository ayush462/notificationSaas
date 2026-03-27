const redis = require("./client");
async function setCache(key, value, ttlSec = 60) { await redis.set(key, JSON.stringify(value), "EX", ttlSec); }
async function getCache(key) { const data = await redis.get(key); return data ? JSON.parse(data) : null; }
module.exports = { setCache, getCache };
