const {
  reserveIdempotency,
  saveIdempotencyResponse,
  getIdempotencyResponse
} = require("../redis/idempotency");
const notificationService = require("../services/notificationService");
const logService = require("../services/logService");

async function createNotification(req, res, next) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];

    // 🔥 STEP 1: Check if already processed
    const existing = await getIdempotencyResponse(idempotencyKey);
    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        replayed: true
      });
    }

    // 🔥 STEP 2: Reserve key
    const reserved = await reserveIdempotency(idempotencyKey);
    if (!reserved) {
      return res.status(409).json({
        success: false,
        message: "Duplicate request (processing)"
      });
    }

    // STEP 3: Build multi-channel payload
    const channel = req.body.channel || "email";
    const payload = {
      projectId: req.projectId,
      apiKeyId: req.apiKeyId || null,
      channel,
      recipientEmail: req.body.recipientEmail || (req.body.data && req.body.data.email),
      recipientPhone: req.body.recipientPhone || (req.body.data && req.body.data.phone),
      deviceToken: req.body.deviceToken || (req.body.data && req.body.data.token),
      subject: req.body.subject,
      body: req.body.body,
      event: req.body.event,
      eventName: req.body.event,
      externalUserId: req.body.externalUserId || (req.body.data && req.body.data.userId),
      data: req.body.data,
      metadata: req.body.metadata,
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt).getTime() : undefined
    };

    // STEP 4: Validate per channel
    if (!payload.event) {
      if (channel === "email" && (!payload.recipientEmail || !payload.subject || !payload.body)) {
        return res.status(400).json({ success: false, message: "Email requires: recipientEmail, subject, body (or use event+data)" });
      }
      if (channel === "sms" && (!payload.recipientPhone || !payload.body)) {
        return res.status(400).json({ success: false, message: "SMS requires: recipientPhone, body" });
      }
      if (channel === "push" && (!payload.deviceToken || !payload.subject || !payload.body)) {
        return res.status(400).json({ success: false, message: "Push requires: deviceToken, subject, body" });
      }
    }

    // STEP 5: Process
    const data = await notificationService.enqueueNotification(payload);

    // STEP 6: Track usage for billing
    if (req.usageUserId) {
      const usageService = require("../services/usageService");
      await usageService.incrementUsage(req.projectId, req.usageUserId, channel).catch(() => {});
    }

    // STEP 7: Save response for idempotency replay
    await saveIdempotencyResponse(idempotencyKey, data);

    // STEP 8: Logging
    await logService.writeLog({
      level: "info",
      service: "api",
      event: "notification_queued",
      requestId: req.requestId,
      apiKeyHash: req.apiKeyHash,
      projectId: req.projectId,
      metadata: {
        notificationId: data.id,
        channel,
        eventName: payload.event || "direct"
      }
    });

    return res.status(202).json({ success: true, data });

  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message
      });
    }
    next(e);
  }
}

async function listNotifications(req, res, next) {
  try {
    const data = await notificationService.getNotifications(req.projectId, {
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
      status: req.query.status || undefined
    });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function listDlq(req, res, next) {
  try {
    const data = await notificationService.getDlqItems(req.projectId, Number(req.query.limit || 50));
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function requeueDlq(req, res, next) {
  try {
    const data = await notificationService.requeueNotification(req.params.id, req.projectId);
    if (!data) return res.status(404).json({ success: false, message: "Notification not found" });
    await logService.writeLog({
      level: "info", service: "api", event: "notification_requeued",
      requestId: req.requestId, projectId: req.projectId,
      metadata: { notificationId: req.params.id }
    });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function bulkRequeueDlq(req, res, next) {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "Body must include ids: string[]" });
    }
    const result = await notificationService.requeueBulk(ids, req.projectId);
    await logService.writeLog({
      level: "info", service: "api", event: "notification_bulk_requeued",
      requestId: req.requestId, projectId: req.projectId,
      metadata: { count: result.count, ids: result.requeued.map((r) => r.id) }
    });
    return res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

module.exports = { createNotification, listNotifications, listDlq, requeueDlq, bulkRequeueDlq };
