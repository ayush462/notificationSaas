const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const adminService = require("../services/adminService");
const notificationService = require("../services/notificationService");
const logService = require("../services/logService");
const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

// System overview stats + charts
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json({ success: true, data: stats });
  } catch (e) { next(e); }
});

// Recent errors across all projects
router.get("/errors", async (req, res, next) => {
  try {
    const errors = await adminService.getRecentErrors(Number(req.query.limit || 20));
    res.json({ success: true, data: errors });
  } catch (e) { next(e); }
});

// DLQ summary per project
router.get("/dlq-summary", async (req, res, next) => {
  try {
    const summary = await adminService.getDlqSummary();
    res.json({ success: true, data: summary });
  } catch (e) { next(e); }
});

// All notifications (cross-project)
router.get("/notifications", async (req, res, next) => {
  try {
    const data = await notificationService.getAllNotifications({
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
      status: req.query.status || undefined
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// All DLQ items
router.get("/dlq", async (req, res, next) => {
  try {
    const data = await notificationService.getAllDlqItems(Number(req.query.limit || 50));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// All logs
router.get("/logs", async (req, res, next) => {
  try {
    const data = await logService.listAllLogs({
      limit: Number(req.query.limit || 200),
      offset: Number(req.query.offset || 0),
      level: req.query.level || undefined,
      service: req.query.service || undefined,
      q: req.query.q || undefined
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// Requeue from admin (no project filter)
router.post("/dlq/:id/requeue", async (req, res, next) => {
  try {
    const data = await notificationService.requeueNotification(req.params.id, null);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// GET provider health from worker
router.get("/health", async (req, res, next) => {
  try {
    const workerUrl = (process.env.WORKER_URL || "http://localhost:3001").replace(/\/$/, "");
    const response = await fetch(`${workerUrl}/provider-health`);
    if (!response.ok) throw new Error("Worker health endpoint returned error status");
    const data = await response.json();
    res.json({ success: true, data });
  } catch (e) {
    console.error("DEBUG: Admin health check fail:", e.message);
    res.status(503).json({ success: false, message: "Worker health service unavailable", error: e.message });
  }
});

module.exports = router;
