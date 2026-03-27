const { checkRateLimit } = require("../redis/rateLimiter");

module.exports = async function rateLimitMiddleware(req, res, next) {
  try {
    const key = req.apiKeyHash || req.ip;
    const result = await checkRateLimit(key);
    if (!result.allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded" });
    res.setHeader("X-RateLimit-Remaining", String(result.remaining));
    next();
  } catch (e) { next(e); }
};
