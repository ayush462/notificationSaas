const webhookService = require("../services/webhookService");
const projectService = require("../services/projectService");

async function ensureProjectAccess(req, res) {
  const project = await projectService.getProject(req.params.projectId, req.user.userId);
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }
  return project;
}

async function listWebhooks(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const webhooks = await webhookService.getWebhooks(project.id);
    res.json({ success: true, data: webhooks });
  } catch (err) {
    next(err);
  }
}

async function createWebhook(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { url, events } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "url is required" });
    const webhook = await webhookService.createWebhook(project.id, url, events || ["*"]);
    res.status(201).json({ success: true, data: webhook });
  } catch (err) {
    next(err);
  }
}

async function deleteWebhook(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const deleted = await webhookService.deleteWebhook(project.id, req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Webhook not found" });
    res.json({ success: true, data: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = { listWebhooks, createWebhook, deleteWebhook };
