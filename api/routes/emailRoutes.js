const express = require("express");
const { sendEmail } = require("../controllers/emailController");
const auth = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimitMiddleware");
const router = express.Router();
router.post("/", auth, rateLimit, sendEmail);
module.exports = router;
