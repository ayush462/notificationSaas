const express = require("express");
const controller = require("../controllers/inappController");
const requireApiKey = require("../middleware/authMiddleware");

// Use the existing API Key auth because these routes are hit by the backend SDK 
// or from a secure frontend component initialized with a public API key.
const router = express.Router();

router.use(requireApiKey);

// Routes scoped under /v1/inapp
router.get("/:externalUserId", controller.getFeed);
router.post("/:externalUserId/read", controller.markAllAsRead);
router.patch("/:externalUserId/read/:notificationId", controller.markAsRead);

module.exports = router;
