const inappService = require("../services/inappService");

async function getFeed(req, res, next) {
  try {
    const { externalUserId } = req.params;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    const feed = await inappService.getFeed(req.projectId, externalUserId, limit, offset);
    res.json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { externalUserId, notificationId } = req.params;
    const success = await inappService.markAsRead(req.projectId, externalUserId, notificationId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Notification not found or access denied" });
    }
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const { externalUserId } = req.params;
    const count = await inappService.markAllAsRead(req.projectId, externalUserId);
    res.json({ success: true, marked: count });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeed, markAsRead, markAllAsRead };
