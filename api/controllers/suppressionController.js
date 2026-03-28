const suppressionService = require("../services/suppressionService");
const projectService = require("../services/projectService");

async function ensureProjectAccess(req, res) {
  const project = await projectService.getProject(req.params.projectId, req.user.userId);
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }
  return project;
}

async function listSuppressions(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const data = await suppressionService.listSuppressions(project.id, limit, offset);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function removeSuppression(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "email is required" });
    const deleted = await suppressionService.removeSuppression(project.id, email);
    res.json({ success: true, data: deleted });
  } catch (err) {
    next(err);
  }
}

async function addSuppression(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { email, reason } = req.body;
    const added = await suppressionService.addSuppression(project.id, email, reason || "manual");
    res.json({ success: true, data: added });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSuppressions, removeSuppression, addSuppression };
