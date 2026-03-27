const crypto = require("crypto");
const { nanoid } = require("nanoid");
const pool = require("../db/pool");

function hashKey(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function createApiKey(appName, ownerEmail) {
  const raw = `nk_${nanoid(32)}`;
  const keyHash = hashKey(raw);
  const r = await pool.query(
    "INSERT INTO api_keys (key_hash, app_name, owner_email, active) VALUES ($1, $2, $3, TRUE) RETURNING id",
    [keyHash, appName, ownerEmail || null]
  );
  return { id: r.rows[0].id, apiKey: raw };
}

async function validateApiKey(raw) {
  const hash = hashKey(raw || "");
  const result = await pool.query("SELECT * FROM api_keys WHERE key_hash = $1 AND active = TRUE LIMIT 1", [hash]);
  return result.rows[0] || null;
}

async function listApiKeys(limit = 100) {
  const result = await pool.query(
    "SELECT id, app_name, owner_email, active, created_at FROM api_keys ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}

/** Soft-delete: key stops working immediately */
async function deactivateApiKey(id) {
  const r = await pool.query(
    "UPDATE api_keys SET active = FALSE WHERE id = $1 RETURNING id, app_name",
    [id]
  );
  return r.rows[0] || null;
}

module.exports = { hashKey, createApiKey, validateApiKey, listApiKeys, deactivateApiKey };
