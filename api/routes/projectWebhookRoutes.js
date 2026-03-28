const express = require("express");
const controller = require("../controllers/webhookApiController");
const router = express.Router({ mergeParams: true });
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/", controller.listWebhooks);
router.post("/", controller.createWebhook);
router.delete("/:id", controller.deleteWebhook);

module.exports = router;
