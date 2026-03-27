const express = require("express");
const controller = require("../controllers/notificationController");
const apiKeyAuth = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimitMiddleware");
const checkUsageLimit = require("../middleware/usageLimit");
const router = express.Router();

// All notification routes require API key (SDK access)
router.post("/", apiKeyAuth, rateLimit, checkUsageLimit, controller.createNotification);
router.get("/", apiKeyAuth, controller.listNotifications);
router.get("/dlq", apiKeyAuth, controller.listDlq);
router.post("/dlq/requeue-bulk", apiKeyAuth, rateLimit, controller.bulkRequeueDlq);
router.post("/dlq/:id/requeue", apiKeyAuth, rateLimit, controller.requeueDlq);

module.exports = router;
