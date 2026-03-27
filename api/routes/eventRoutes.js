const express = require("express");
const controller = require("../controllers/eventController");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", controller.create);
router.get("/", controller.list);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/preview", controller.preview);
router.post("/preview-html", controller.previewHtml);

module.exports = router;
