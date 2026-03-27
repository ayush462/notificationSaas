const pool = require("../db/pool");

async function getSystemStats() {
  const [usersR, projectsR, keysR, notifsR, logsR, statusR, dailyR, topProjectsR] = await Promise.all([
    pool.query("SELECT COUNT(*) as count FROM users"),
    pool.query("SELECT COUNT(*) as count FROM projects"),
    pool.query("SELECT COUNT(*) as count FROM api_keys WHERE active = TRUE"),
    pool.query("SELECT COUNT(*) as count FROM notifications"),
    pool.query("SELECT COUNT(*) as count FROM system_logs"),
    pool.query(`
      SELECT status, COUNT(*) as count FROM notifications
      GROUP BY status ORDER BY count DESC
    `),
    pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM notifications
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(created_at) ORDER BY date
    `),
    pool.query(`
      SELECT p.id, p.name, u.email as owner_email,
        COUNT(n.id) as total_notifications,
        COUNT(n.id) FILTER (WHERE n.status = 'sent') as sent,
        COUNT(n.id) FILTER (WHERE n.status = 'failed') as failed
      FROM projects p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN notifications n ON n.project_id = p.id
      GROUP BY p.id, p.name, u.email
      ORDER BY total_notifications DESC
      LIMIT 10
    `)
  ]);

  const statusMap = {};
  for (const row of statusR.rows) statusMap[row.status] = Number(row.count);

  return {
    users: Number(usersR.rows[0].count),
    projects: Number(projectsR.rows[0].count),
    activeKeys: Number(keysR.rows[0].count),
    totalNotifications: Number(notifsR.rows[0].count),
    totalLogs: Number(logsR.rows[0].count),
    statusBreakdown: statusMap,
    dailyVolume: dailyR.rows.map(r => ({
      date: r.date,
      count: Number(r.count),
      sent: Number(r.sent),
      failed: Number(r.failed)
    })),
    topProjects: topProjectsR.rows.map(r => ({
      id: r.id,
      name: r.name,
      ownerEmail: r.owner_email,
      total: Number(r.total_notifications),
      sent: Number(r.sent),
      failed: Number(r.failed)
    }))
  };
}

async function getRecentErrors(limit = 20) {
  const result = await pool.query(`
    SELECT sl.*, p.name as project_name
    FROM system_logs sl
    LEFT JOIN projects p ON p.id = sl.project_id
    WHERE sl.level = 'error'
    ORDER BY sl.created_at DESC LIMIT $1
  `, [limit]);
  return result.rows;
}

async function getDlqSummary() {
  const result = await pool.query(`
    SELECT n.project_id, p.name as project_name, COUNT(*) as count,
      MAX(n.processed_at) as last_failure
    FROM notifications n
    JOIN projects p ON p.id = n.project_id
    WHERE n.status = 'failed'
    GROUP BY n.project_id, p.name
    ORDER BY count DESC
  `);
  return result.rows.map(r => ({ ...r, count: Number(r.count) }));
}

module.exports = { getSystemStats, getRecentErrors, getDlqSummary };
