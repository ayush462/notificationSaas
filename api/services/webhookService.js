const pool = require("../db/pool");
const crypto = require("crypto");

/**
 * Add a webhook.
 */
async function createWebhook(projectId, url, events) {
  const secret = `whsec_${crypto.randomBytes(16).toString("hex")}`;
  const result = await pool.query(
    `INSERT INTO webhooks (project_id, url, secret, events, active)
     VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
    [projectId, url, secret, JSON.stringify(events)]
  );
  return result.rows[0];
}

/**
 * Get webhooks for a project.
 */
async function getWebhooks(projectId) {
  const result = await pool.query(
    "SELECT id, url, events, active, created_at FROM webhooks WHERE project_id = $1 ORDER BY created_at DESC",
    [projectId]
  );
  // parse events array safely
  return result.rows.map(r => ({ ...r, events: typeof r.events === "string" ? JSON.parse(r.events) : r.events }));
}

/**
 * Delete a webhook.
 */
async function deleteWebhook(projectId, id) {
  const result = await pool.query(
    "DELETE FROM webhooks WHERE project_id = $1 AND id = $2 RETURNING *",
    [projectId, id]
  );
  return result.rows[0];
}

/**
 * Fire webhooks for a specific event
 */
async function fireEvent(projectId, eventName, payload) {
  try {
    const hooks = await pool.query(
      `SELECT url, secret, events FROM webhooks 
       WHERE project_id = $1 AND active = TRUE`,
      [projectId]
    );

    if (!hooks.rows.length) return;

    for (const hook of hooks.rows) {
      const parsedEvents = typeof hook.events === "string" ? JSON.parse(hook.events) : hook.events;
      if (parsedEvents.includes("*") || parsedEvents.includes(eventName)) {
        // Prepare payload
        const timestamp = Date.now();
        const dataStr = JSON.stringify({ event: eventName, timestamp, data: payload });
        
        // Sign payload
        const signature = crypto
          .createHmac("sha256", hook.secret)
          .update(`${timestamp}.${dataStr}`)
          .digest("hex");
          
        fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "NotifyStack-Signature": `t=${timestamp},v1=${signature}`
          },
          body: dataStr
        }).catch(err => console.error(`Failed to fire webhook to ${hook.url}:`, err.message));
      }
    }
  } catch (err) {
    console.error("Error firing webhook:", err.message);
  }
}

module.exports = { createWebhook, getWebhooks, deleteWebhook, fireEvent };
