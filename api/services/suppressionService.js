const pool = require("../db/pool");

/**
 * Add an email to the suppression list.
 */
async function addSuppression(projectId, email, reason) {
  const result = await pool.query(
    `INSERT INTO email_suppressions (project_id, email, reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, email) DO UPDATE SET reason = $3, created_at = NOW()
     RETURNING *`,
    [projectId, email, reason]
  );
  return result.rows[0];
}

/**
 * Remove an email from the suppression list.
 */
async function removeSuppression(projectId, email) {
  const result = await pool.query(
    "DELETE FROM email_suppressions WHERE project_id = $1 AND email = $2 RETURNING *",
    [projectId, email]
  );
  return result.rows[0];
}

/**
 * Check if an email is suppressed for a specific project.
 */
async function isSuppressed(projectId, email) {
  if (!email) return false;
  const result = await pool.query(
    "SELECT reason FROM email_suppressions WHERE project_id = $1 AND email = $2 LIMIT 1",
    [projectId, email]
  );
  return result.rows[0] ? result.rows[0].reason : null;
}

/**
 * List suppressions for a project.
 */
async function listSuppressions(projectId, limit = 50, offset = 0) {
  const result = await pool.query(
    "SELECT * FROM email_suppressions WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [projectId, limit, offset]
  );
  const countResult = await pool.query(
    "SELECT COUNT(*) as total FROM email_suppressions WHERE project_id = $1",
    [projectId]
  );
  return { items: result.rows, total: Number(countResult.rows[0].total) };
}

module.exports = { addSuppression, removeSuppression, isSuppressed, listSuppressions };
