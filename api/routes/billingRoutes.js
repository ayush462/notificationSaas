const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const billingService = require("../services/billingService");
const usageService = require("../services/usageService");
const router = express.Router();

router.use(requireAuth);

// Get available plans
router.get("/plans", async (req, res, next) => {
  try {
    const data = await billingService.getPlans();
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// Get current plan
router.get("/plan", async (req, res, next) => {
  try {
    const data = await billingService.getUserPlan(req.user.userId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// Get usage stats
router.get("/usage", async (req, res, next) => {
  try {
    const data = await usageService.checkUsage(req.user.userId);
    const history = await usageService.getUsageHistory(req.user.userId, Number(req.query.days || 30));
    res.json({ success: true, data: { ...data, history } });
  } catch (e) { next(e); }
});

// Create checkout session
router.post("/checkout", async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ success: false, message: "planId is required" });
    const data = await billingService.createCheckoutSession(req.user.userId, planId);
    res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
});

// Cancel Subscription
router.post("/cancel", async (req, res, next) => {
  try {
    const data = await billingService.cancelSubscription(req.user.userId);
    res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
});

// Invoice history
router.get("/invoices", async (req, res, next) => {
  try {
    const data = await billingService.getInvoices(req.user.userId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

module.exports = router;
