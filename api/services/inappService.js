const pool = require("../db/pool");

/**
 * Get feed of notifications for an external user in a specific project.
 */
async function getFeed(projectId, externalUserId, limit = 20, offset = 0) {
  const result = await pool.query(
    `SELECT id, channel, subject, body, status, created_at, read_at, metadata 
     FROM notifications 
     WHERE project_id = $1 AND external_user_id = $2
     ORDER BY created_at DESC 
     LIMIT $3 OFFSET $4`,
    [projectId, externalUserId, limit, offset]
  );
  
  const unreadCount = await pool.query(
    `SELECT COUNT(*) FROM notifications 
     WHERE project_id = $1 AND external_user_id = $2 AND read_at IS NULL`,
    [projectId, externalUserId]
  );

  return { 
    items: result.rows, 
    unreadCount: Number(unreadCount.rows[0].count)
  };
}

/**
 * Mark a single notification as read.
 */
async function markAsRead(projectId, externalUserId, notificationId) {
  const result = await pool.query(
    `UPDATE notifications 
     SET read_at = NOW() 
     WHERE id = $1 AND project_id = $2 AND external_user_id = $3
     RETURNING id`,
    [notificationId, projectId, externalUserId]
  );
  return result.rowCount > 0;
}

/**
 * Mark all notifications as read for a user.
 */
async function markAllAsRead(projectId, externalUserId) {
  const result = await pool.query(
    `UPDATE notifications 
     SET read_at = NOW() 
     WHERE project_id = $1 AND external_user_id = $2 AND read_at IS NULL`,
    [projectId, externalUserId]
  );
  return result.rowCount;
}

module.exports = { getFeed, markAsRead, markAllAsRead };
