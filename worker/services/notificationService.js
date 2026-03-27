const pool = require("../db/pool");

async function markSent(id) {
  await pool.query("UPDATE notifications SET status='sent', processed_at=NOW() WHERE id=$1", [id]);
}

async function markFailed(id, attempts, errorMessage) {
  await pool.query("UPDATE notifications SET status='failed', attempts=$2, error_message=$3, processed_at=NOW() WHERE id=$1", [id, attempts, errorMessage]);
}

async function markRetrying(id, attempts, errorMessage) {
  await pool.query("UPDATE notifications SET status='retrying', attempts=$2, error_message=$3 WHERE id=$1", [id, attempts, errorMessage]);
}

module.exports = { markSent, markFailed, markRetrying };
