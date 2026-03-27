const express = require("express");
const controller = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimitMiddleware");
const router = express.Router();

router.post("/", auth, rateLimit, controller.createNotification);
router.get("/", auth, controller.listNotifications);
router.get("/dlq", auth, controller.listDlq);
router.post("/dlq/requeue-bulk", auth, rateLimit, controller.bulkRequeueDlq);
router.post("/dlq/:id/requeue", auth, rateLimit, controller.requeueDlq);

module.exports = router;
