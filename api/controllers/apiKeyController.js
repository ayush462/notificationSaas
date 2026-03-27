const apikeyService = require("../services/apikeyService");
const logService = require("../services/logService");

async function createKey(req, res, next) {
  try {
    const { appName, ownerEmail } = req.body;
    if (!appName) {
      return res.status(400).json({ success: false, message: "appName is required" });
    }
    const data = await apikeyService.createApiKey(appName, ownerEmail);
    await logService.writeLog("info", "api_key_created", { appName, ownerEmail: ownerEmail || null });
    return res.status(201).json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

async function listKeys(req, res, next) {
  try {
    const limit = Number(req.query.limit || 100);
    const data = await apikeyService.listApiKeys(limit);
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

async function deleteKey(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const row = await apikeyService.deactivateApiKey(id);
    if (!row) {
      return res.status(404).json({ success: false, message: "API key not found" });
    }
    await logService.writeLog("info", "api_key_deactivated", { keyId: id, appName: row.app_name });
    return res.json({ success: true, data: { id: row.id, deactivated: true } });
  } catch (e) {
    return next(e);
  }
}

module.exports = { createKey, listKeys, deleteKey };
