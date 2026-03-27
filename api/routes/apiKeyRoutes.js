const express = require("express");
const controller = require("../controllers/apiKeyController");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

router.post("/", adminMiddleware, controller.createKey);
router.get("/", adminMiddleware, controller.listKeys);
router.delete("/:id", adminMiddleware, controller.deleteKey);

module.exports = router;
