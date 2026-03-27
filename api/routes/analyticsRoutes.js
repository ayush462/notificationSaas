const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const analyticsService = require("../services/analyticsService");
const router = express.Router();

router.use(requireAuth);

function extractFilters(req) {
  return {
    from: req.query.from || undefined,
    to: req.query.to || undefined,
    granularity: req.query.granularity || "day",
    limit: Number(req.query.limit || 10)
  };
}

router.get("/overview", async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview(req.query.projectId, extractFilters(req));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get("/timeseries", async (req, res, next) => {
  try {
    const data = await analyticsService.getTimeseries(req.query.projectId, extractFilters(req));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get("/providers", async (req, res, next) => {
  try {
    const data = await analyticsService.getProviderStats(req.query.projectId, extractFilters(req));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get("/events", async (req, res, next) => {
  try {
    const data = await analyticsService.getTopEvents(req.query.projectId, extractFilters(req));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get("/channels", async (req, res, next) => {
  try {
    const data = await analyticsService.getChannelBreakdown(req.query.projectId, extractFilters(req));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

module.exports = router;
