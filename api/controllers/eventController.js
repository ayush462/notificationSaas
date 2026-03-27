const eventService = require("../services/eventService");
const projectService = require("../services/projectService");

async function ensureProjectAccess(req, res) {
  const project = await projectService.getProject(req.params.projectId, req.user.userId);
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }
  return project;
}

async function create(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { eventName, subjectTemplate, bodyTemplate } = req.body;
    if (!eventName || !subjectTemplate || !bodyTemplate) {
      return res.status(400).json({ success: false, message: "eventName, subjectTemplate, and bodyTemplate are required" });
    }
    const data = await eventService.createTemplate(project.id, eventName, subjectTemplate, bodyTemplate);
    return res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ success: false, message: "Event template with this name already exists" });
    }
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const data = await eventService.listTemplates(project.id);
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const data = await eventService.updateTemplate(req.params.id, project.id, {
      eventName: req.body.eventName,
      subjectTemplate: req.body.subjectTemplate,
      bodyTemplate: req.body.bodyTemplate
    });
    if (!data) return res.status(404).json({ success: false, message: "Template not found" });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const data = await eventService.deleteTemplate(req.params.id, project.id);
    if (!data) return res.status(404).json({ success: false, message: "Template not found" });
    return res.json({ success: true, data: { deleted: true, ...data } });
  } catch (e) {
    next(e);
  }
}

async function preview(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { eventName, data } = req.body;
    if (!eventName) return res.status(400).json({ success: false, message: "eventName is required" });
    const template = await eventService.getTemplate(project.id, eventName);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });
    const resolved = eventService.resolveTemplate(template, data || {});
    return res.json({ success: true, data: resolved });
  } catch (e) {
    next(e);
  }
}

async function previewHtml(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { eventName, data } = req.body;
    if (!eventName) return res.status(400).json({ success: false, message: "eventName is required" });
    const template = await eventService.getTemplate(project.id, eventName);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });
    const resolved = eventService.resolveTemplate(template, data || {});
    const { buildHtmlEmail } = require("../services/emailTemplate");
    const html = buildHtmlEmail({
      subject: resolved.subject,
      body: resolved.body,
      eventName: eventName.toUpperCase(),
      recipientEmail: (data && data.email) || "user@example.com"
    });
    return res.json({ success: true, data: { ...resolved, html } });
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list, update, remove, preview, previewHtml };
