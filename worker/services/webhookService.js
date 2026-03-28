const pool = require("../db/pool");
const crypto = require("crypto");

/**
 * Fire webhooks for a specific event
 */
async function fireEvent(projectId, eventName, payload) {
  if (!projectId) return;
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
        }).catch(err => console.error(`[Webhook worker] Failed to fire to ${hook.url}:`, err.message));
      }
    }
  } catch (err) {
    console.error("[Webhook worker] Error firing event:", err.message);
  }
}

module.exports = { fireEvent };
