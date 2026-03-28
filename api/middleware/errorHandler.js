const logService = require("../services/logService");

module.exports = function errorHandler(err, req, res, next) {
  req.log?.error({ err }, "unhandled_error");
  logService.writeLog({
    level: "error",
    service: "api",
    event: "unhandled_error",
    requestId: req.requestId,
    userId: req.user?.userId || null,
    projectId: req.projectId || null,
    metadata: { message: err.message, stack: err.stack }
  }).catch(() => {});
  res.status(err.statusCode || 500).json({ 
    success: false, 
    message: err.message || "Internal server error",
    debug: { stack: err.stack, details: err }
  });
};
