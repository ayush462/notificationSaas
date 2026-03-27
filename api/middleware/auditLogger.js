const logService = require("../services/logService");

module.exports = function auditLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logService
      .writeLog("info", "http_request", {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip
      })
      .catch(() => {});
  });
  next();
};
