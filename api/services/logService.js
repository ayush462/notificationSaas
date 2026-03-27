const pool = require("../db/pool");

async function writeLog(level, message, context) {
  await pool.query(
    "INSERT INTO system_logs (level, message, context) VALUES ($1,$2,$3)",
    [level, message, context ? JSON.stringify(context) : null]
  );
}

async function listLogs(options = {}) {
  const limit = Math.min(Number(options.limit) || 200, 500);
  const offset = Math.max(Number(options.offset) || 0, 0);
  const level = options.level;
  const messageLike = options.messageLike;

  const params = [];
  let where = "WHERE 1=1";
  if (level) {
    params.push(level);
    where += ` AND level = $${params.length}`;
  }
  if (messageLike) {
    params.push(`%${messageLike}%`);
    where += ` AND message ILIKE $${params.length}`;
  }
  params.push(limit);
  params.push(offset);
  const limIdx = params.length - 1;
  const offIdx = params.length;
  const q = `
    SELECT * FROM system_logs
    ${where}
    ORDER BY created_at DESC
    LIMIT $${limIdx} OFFSET $${offIdx}
  `;
  const r = await pool.query(q, params);
  return r.rows;
}

module.exports = { writeLog, listLogs };
