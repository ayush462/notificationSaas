const pool = require("../db/pool");

async function getOverview(projectId, { from, to } = {}) {
  const params = [];
  let dateFilter = "";
  let idx = 1;

  if (projectId) {
    params.push(projectId);
    dateFilter += ` AND project_id = $${idx++}`;
  }
  if (from) {
    params.push(from);
    dateFilter += ` AND created_at >= $${idx++}`;
  }
  if (to) {
    params.push(to);
    dateFilter += ` AND created_at <= $${idx++}`;
  }

  const result = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status = 'queued') as queued,
      COUNT(*) FILTER (WHERE status = 'retrying') as retrying,
      ROUND(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL)) as avg_latency_ms,
      ROUND(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL AND status = 'sent')) as avg_success_latency_ms,
      COUNT(DISTINCT channel) as channels_used,
      COUNT(DISTINCT provider) FILTER (WHERE provider IS NOT NULL) as providers_used
    FROM notifications WHERE 1=1 ${dateFilter}
  `, params);

  const r = result.rows[0];
  const total = Number(r.total);
  return {
    total,
    sent: Number(r.sent),
    failed: Number(r.failed),
    queued: Number(r.queued),
    retrying: Number(r.retrying),
    successRate: total > 0 ? ((Number(r.sent) / total) * 100).toFixed(1) : "0.0",
    failureRate: total > 0 ? ((Number(r.failed) / total) * 100).toFixed(1) : "0.0",
    avgLatencyMs: Number(r.avg_latency_ms) || 0,
    avgSuccessLatencyMs: Number(r.avg_success_latency_ms) || 0,
    channelsUsed: Number(r.channels_used),
    providersUsed: Number(r.providers_used)
  };
}

async function getTimeseries(projectId, { from, to, granularity = "day" } = {}) {
  const params = [];
  let filters = "";
  let idx = 1;

  if (projectId) { params.push(projectId); filters += ` AND project_id = $${idx++}`; }
  if (from) { params.push(from); filters += ` AND created_at >= $${idx++}`; }
  if (to) { params.push(to); filters += ` AND created_at <= $${idx++}`; }

  const trunc = granularity === "week" ? "week" : granularity === "month" ? "month" : "day";

  const result = await pool.query(`
    SELECT
      DATE_TRUNC('${trunc}', created_at) as date,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE channel = 'email') as email,
      COUNT(*) FILTER (WHERE channel = 'sms') as sms,
      COUNT(*) FILTER (WHERE channel = 'push') as push,
      ROUND(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL)) as avg_latency
    FROM notifications WHERE 1=1 ${filters}
    GROUP BY DATE_TRUNC('${trunc}', created_at)
    ORDER BY date
  `, params);

  return result.rows.map(r => ({
    date: r.date,
    total: Number(r.total),
    sent: Number(r.sent),
    failed: Number(r.failed),
    email: Number(r.email),
    sms: Number(r.sms),
    push: Number(r.push),
    avgLatency: Number(r.avg_latency) || 0
  }));
}

async function getProviderStats(projectId, { from, to } = {}) {
  const params = [];
  let filters = "";
  let idx = 1;

  if (projectId) { params.push(projectId); filters += ` AND project_id = $${idx++}`; }
  if (from) { params.push(from); filters += ` AND created_at >= $${idx++}`; }
  if (to) { params.push(to); filters += ` AND created_at <= $${idx++}`; }

  const result = await pool.query(`
    SELECT
      COALESCE(provider, 'unknown') as provider,
      channel,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      ROUND(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL)) as avg_latency,
      MIN(latency_ms) FILTER (WHERE latency_ms IS NOT NULL) as min_latency,
      MAX(latency_ms) FILTER (WHERE latency_ms IS NOT NULL) as max_latency
    FROM notifications WHERE 1=1 ${filters}
    GROUP BY COALESCE(provider, 'unknown'), channel
    ORDER BY total DESC
  `, params);

  return result.rows.map(r => ({
    provider: r.provider,
    channel: r.channel,
    total: Number(r.total),
    sent: Number(r.sent),
    failed: Number(r.failed),
    successRate: Number(r.total) > 0 ? ((Number(r.sent) / Number(r.total)) * 100).toFixed(1) : "0.0",
    avgLatency: Number(r.avg_latency) || 0,
    minLatency: Number(r.min_latency) || 0,
    maxLatency: Number(r.max_latency) || 0
  }));
}

async function getTopEvents(projectId, { from, to, limit = 10 } = {}) {
  const params = [];
  let filters = "";
  let idx = 1;

  if (projectId) { params.push(projectId); filters += ` AND project_id = $${idx++}`; }
  if (from) { params.push(from); filters += ` AND created_at >= $${idx++}`; }
  if (to) { params.push(to); filters += ` AND created_at <= $${idx++}`; }
  params.push(limit);

  const result = await pool.query(`
    SELECT
      COALESCE(event_name, 'direct') as event_name,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed
    FROM notifications WHERE 1=1 ${filters}
    GROUP BY COALESCE(event_name, 'direct')
    ORDER BY total DESC LIMIT $${idx}
  `, params);

  return result.rows.map(r => ({
    eventName: r.event_name,
    total: Number(r.total),
    sent: Number(r.sent),
    failed: Number(r.failed)
  }));
}

async function getChannelBreakdown(projectId, { from, to } = {}) {
  const params = [];
  let filters = "";
  let idx = 1;

  if (projectId) { params.push(projectId); filters += ` AND project_id = $${idx++}`; }
  if (from) { params.push(from); filters += ` AND created_at >= $${idx++}`; }
  if (to) { params.push(to); filters += ` AND created_at <= $${idx++}`; }

  const result = await pool.query(`
    SELECT
      channel,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'sent') as sent,
      COUNT(*) FILTER (WHERE status = 'failed') as failed
    FROM notifications WHERE 1=1 ${filters}
    GROUP BY channel ORDER BY total DESC
  `, params);

  return result.rows.map(r => ({
    channel: r.channel || "email",
    total: Number(r.total),
    sent: Number(r.sent),
    failed: Number(r.failed)
  }));
}

module.exports = { getOverview, getTimeseries, getProviderStats, getTopEvents, getChannelBreakdown };
