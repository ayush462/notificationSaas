const logService = require("../services/logService");

module.exports = function errorHandler(err, req, res, next) {
  req.log?.error({ err }, "unhandled_error");
  logService.writeLog("error", "unhandled_error", { message: err.message }).catch(() => {});
  res.status(500).json({ success: false, message: "Internal server error" });
};
