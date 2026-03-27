const logService = require("../services/logService");

/**
 * Audit logger — only logs meaningful events, NOT every HTTP request.
 * HTTP request logs are handled by pino-http (requestLogger) to stdout only.
 * This middleware only writes to DB for non-2xx responses (errors/warnings).
 */
module.exports = function auditLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    // Only log errors and warnings to DB — skip normal 2xx/3xx requests
    if (res.statusCode < 400) return;

    const durationMs = Date.now() - start;
    logService.writeLog({
      level: res.statusCode >= 500 ? "error" : "warn",
      service: "api",
      event: res.statusCode >= 500 ? "server_error" : "client_error",
      requestId: req.requestId,
      userId: req.user?.userId || null,
      projectId: req.projectId || null,
      apiKeyHash: req.apiKeyHash || null,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip
      }
    }).catch(() => {});
  });
  next();
};
