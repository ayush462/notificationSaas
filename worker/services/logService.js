const pool = require("../db/pool");

async function writeLog(level, message, context) {
  await pool.query(
    "INSERT INTO system_logs (level, message, context) VALUES ($1,$2,$3)",
    [level, message, context ? JSON.stringify(context) : null]
  );
}

module.exports = { writeLog };
