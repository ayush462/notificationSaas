const apikeyService = require("../services/apikeyService");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!apiKey) return res.status(401).json({ success: false, message: "Missing API key" });
    const record = await apikeyService.validateApiKey(apiKey);
    if (!record) return res.status(403).json({ success: false, message: "Invalid API key" });
    req.apiKeyHash = record.key_hash;
    next();
  } catch (e) { next(e); }
};
