const express = require("express");
const controller = require("../controllers/logController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", auth, controller.getLogs);
router.get("/export", auth, controller.exportLogs);

module.exports = router;
