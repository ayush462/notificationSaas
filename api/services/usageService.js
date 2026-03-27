const pool = require("../db/pool");

const PLAN_LIMITS = {
  FREE: 1000,
  PRO: 50000,
  SCALE: 999999999
};

async function getMonthlyUsage(userId) {
  const result = await pool.query(`
    SELECT COALESCE(SUM(count), 0) as total, channel
    FROM usage_logs
    WHERE user_id = $1
      AND date >= DATE_TRUNC('month', CURRENT_DATE)
      AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    GROUP BY channel
  `, [userId]);

  const byChannel = {};
  let total = 0;
  for (const row of result.rows) {
    byChannel[row.channel] = Number(row.total);
    total += Number(row.total);
  }
  return { total, byChannel };
}

async function getUserPlanLimit(userId) {
  const result = await pool.query("SELECT plan FROM users WHERE id = $1", [userId]);
  if (!result.rows[0]) return 0;
  const plan = result.rows[0].plan || "FREE";
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

async function checkUsage(userId) {
  const usage = await getMonthlyUsage(userId);
  const limit = await getUserPlanLimit(userId);
  return {
    used: usage.total,
    limit,
    remaining: Math.max(0, limit - usage.total),
    exceeded: usage.total >= limit,
    byChannel: usage.byChannel,
    percentUsed: limit > 0 ? ((usage.total / limit) * 100).toFixed(1) : "0.0"
  };
}

async function incrementUsage(projectId, userId, channel = "email") {
  await pool.query(`
    INSERT INTO usage_logs (project_id, user_id, date, channel, count)
    VALUES ($1, $2, CURRENT_DATE, $3, 1)
    ON CONFLICT (project_id, date, channel)
    DO UPDATE SET count = usage_logs.count + 1
  `, [projectId, userId, channel]);
}

async function getUsageHistory(userId, days = 30) {
  const result = await pool.query(`
    SELECT date, channel, SUM(count) as count
    FROM usage_logs
    WHERE user_id = $1 AND date >= CURRENT_DATE - $2::integer
    GROUP BY date, channel
    ORDER BY date
  `, [userId, days]);
  return result.rows.map(r => ({ date: r.date, channel: r.channel, count: Number(r.count) }));
}

async function resetMonthlyUsage() {
  // Reset at start of each month (called by cron)
  // Usage logs persist for history; limit check uses date filter
  // No actual reset needed — the query filters by current month
  return { message: "Usage is automatically filtered by month" };
}

module.exports = { getMonthlyUsage, getUserPlanLimit, checkUsage, incrementUsage, getUsageHistory, resetMonthlyUsage, PLAN_LIMITS };
