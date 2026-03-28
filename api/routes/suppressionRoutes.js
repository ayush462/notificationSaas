const express = require("express");
const controller = require("../controllers/suppressionController");
const router = express.Router({ mergeParams: true });
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/", controller.listSuppressions);
router.post("/", controller.addSuppression);
router.delete("/", controller.removeSuppression);

module.exports = router;
