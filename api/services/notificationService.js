const { nanoid } = require("nanoid");
const pool = require("../db/pool");
const config = require("../config");
const { getProducer } = require("../kafka/producer");

async function enqueueNotification(input) {
  const id = nanoid();
  await pool.query(
    `INSERT INTO notifications (id, api_key_hash, recipient_email, subject, body, status) VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, input.apiKeyHash, input.recipientEmail, input.subject, input.body, "queued"]
  );

  const producer = await getProducer();
  await producer.send({
    topic: config.topicNotifications,
    messages: [{ key: id, value: JSON.stringify({ id, ...input, attempts: 0 }) }]
  });

  return { id, status: "queued" };
}

async function getNotifications(limit = 50, apiKeyHash = null) {
  if (apiKeyHash) {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE api_key_hash = $1 ORDER BY created_at DESC LIMIT $2",
      [apiKeyHash, limit]
    );
    return result.rows;
  }
  const result = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1", [limit]);
  return result.rows;
}

async function getDlqItems(limit = 50, apiKeyHash = null) {
  if (apiKeyHash) {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE status = 'failed' AND api_key_hash = $1
       ORDER BY processed_at DESC NULLS LAST, created_at DESC LIMIT $2`,
      [apiKeyHash, limit]
    );
    return result.rows;
  }
  const result = await pool.query(
    "SELECT * FROM notifications WHERE status = 'failed' ORDER BY processed_at DESC NULLS LAST, created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}

async function requeueNotification(id, apiKeyHash = null) {
  let result;
  if (apiKeyHash) {
    result = await pool.query(
      "SELECT * FROM notifications WHERE id = $1 AND api_key_hash = $2 LIMIT 1",
      [id, apiKeyHash]
    );
  } else {
    result = await pool.query("SELECT * FROM notifications WHERE id = $1 LIMIT 1", [id]);
  }
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  await pool.query("UPDATE notifications SET status = 'queued', error_message = NULL, attempts = 0 WHERE id = $1", [row.id]);
  const producer = await getProducer();
  await producer.send({
    topic: config.topicNotifications,
    messages: [
      {
        key: row.id,
        value: JSON.stringify({
          id: row.id,
          apiKeyHash: row.api_key_hash,
          recipientEmail: row.recipient_email,
          subject: row.subject,
          body: row.body,
          attempts: 0
        })
      }
    ]
  });
  return { id: row.id, status: "queued" };
}

async function requeueBulk(ids, apiKeyHash) {
  if (!Array.isArray(ids) || !ids.length) {
    return { requeued: [], skipped: [], errors: ["ids array required"] };
  }
  const unique = [...new Set(ids.map(String))];
  const requeued = [];
  const skipped = [];
  for (const id of unique) {
    const data = await requeueNotification(id, apiKeyHash);
    if (data) requeued.push(data);
    else skipped.push(id);
  }
  return { requeued, skipped, count: requeued.length };
}

module.exports = { enqueueNotification, getNotifications, getDlqItems, requeueNotification, requeueBulk };
