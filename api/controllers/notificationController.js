const { ensureIdempotent } = require("../redis/idempotency");
const notificationService = require("../services/notificationService");
const logService = require("../services/logService");

async function createNotification(req, res, next) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];
    const ok = await ensureIdempotent(idempotencyKey);
    if (!ok) return res.status(409).json({ success: false, message: "Duplicate request" });

    const payload = {
      apiKeyHash: req.apiKeyHash,
      recipientEmail: req.body.recipientEmail,
      subject: req.body.subject,
      body: req.body.body
    };
    if (!payload.recipientEmail || !payload.subject || !payload.body) {
      return res.status(400).json({ success: false, message: "recipientEmail, subject and body are required" });
    }

    const data = await notificationService.enqueueNotification(payload);
    await logService.writeLog("info", "notification_queued", { notificationId: data.id });
    return res.status(202).json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

async function listNotifications(req, res, next) {
  try {
    const data = await notificationService.getNotifications(Number(req.query.limit || 50), req.apiKeyHash);
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

async function listDlq(req, res, next) {
  try {
    const data = await notificationService.getDlqItems(Number(req.query.limit || 50), req.apiKeyHash);
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

async function requeueDlq(req, res, next) {
  try {
    const data = await notificationService.requeueNotification(req.params.id, req.apiKeyHash);
    if (!data) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    await logService.writeLog("info", "notification_requeued", { notificationId: req.params.id });
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

async function bulkRequeueDlq(req, res, next) {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "Body must include ids: string[]" });
    }
    const result = await notificationService.requeueBulk(ids, req.apiKeyHash);
    await logService.writeLog("info", "notification_bulk_requeued", { count: result.count, ids: result.requeued.map((r) => r.id) });
    return res.json({ success: true, data: result });
  } catch (e) {
    return next(e);
  }
}

module.exports = { createNotification, listNotifications, listDlq, requeueDlq, bulkRequeueDlq };
