const usageService = require("../services/usageService");
const pool = require("../db/pool");

/**
 * Middleware to check usage limits before allowing notification send.
 * Attaches usage info to req for downstream use.
 */
async function checkUsageLimit(req, res, next) {
  try {
    // Get user ID from API key's project owner
    if (!req.projectId) return next();

    const projectResult = await pool.query("SELECT user_id FROM projects WHERE id = $1", [req.projectId]);
    if (!projectResult.rows[0]) return next();

    const userId = projectResult.rows[0].user_id;
    const usage = await usageService.checkUsage(userId);

    if (usage.exceeded) {
      return res.status(429).json({
        success: false,
        message: "Monthly notification limit exceeded. Please upgrade your plan.",
        usage: {
          used: usage.used,
          limit: usage.limit,
          plan: "Upgrade at /billing"
        }
      });
    }

    // Attach for downstream usage tracking
    req.usageUserId = userId;
    req.usageInfo = usage;

    next();
  } catch (err) {
    // Don't block on usage check errors — log and continue
    console.error("Usage check error:", err.message);
    next();
  }
}

module.exports = checkUsageLimit;
