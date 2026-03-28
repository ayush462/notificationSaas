const express = require("express");
const notificationService = require("../services/notificationService");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const router = express.Router();

// Dashboard notification routes (JWT-based, project from query)
router.get("/", requireAuth, async (req, res, next) => {
  try {
    if (!req.query.projectId) return res.status(400).json({ success: false, message: "projectId required" });
    const data = await notificationService.getNotifications(req.query.projectId, {
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
      status: req.query.status || undefined
    });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/dlq", requireAuth, async (req, res, next) => {
  try {
    if (!req.query.projectId) return res.status(400).json({ success: false, message: "projectId required" });
    const data = await notificationService.getDlqItems(req.query.projectId, Number(req.query.limit || 50));
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post("/dlq/:id/requeue", requireAuth, async (req, res, next) => {
  try {
    const data = await notificationService.requeueNotification(req.params.id, req.query.projectId || null);
    if (!data) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post("/dlq/requeue-bulk", requireAuth, async (req, res, next) => {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ success: false, message: "ids array required" });
    const result = await notificationService.requeueBulk(ids, req.query.projectId || null);
    return res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

// Admin: all notifications
router.get("/admin", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const data = await notificationService.getAllNotifications({
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
      status: req.query.status || undefined
    });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// Admin: all DLQ
router.get("/admin/dlq", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const data = await notificationService.getAllDlqItems(Number(req.query.limit || 50));
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
