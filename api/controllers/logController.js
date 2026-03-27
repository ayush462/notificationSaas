const logService = require("../services/logService");

async function getLogs(req, res, next) {
  try {
    const logs = await logService.listLogs({
      limit: Number(req.query.limit || 200),
      offset: Number(req.query.offset || 0),
      level: req.query.level || undefined,
      messageLike: req.query.q || undefined
    });
    res.json({ success: true, data: logs });
  } catch (e) { next(e); }
}

async function exportLogs(req, res, next) {
  try {
    const logs = await logService.listLogs({
      limit: Number(req.query.limit || 2000),
      offset: 0,
      level: req.query.level || undefined,
      messageLike: req.query.q || undefined
    });
    const format = req.query.format || "json";
    if (format === "csv") {
      const header = "id,level,message,created_at\n";
      const rows = logs.map((l) => `${l.id},${l.level},"${String(l.message).replaceAll('"','""')}",${new Date(l.created_at).toISOString()}`).join("\n");
      res.setHeader("Content-Type", "text/csv");
      return res.send(header + rows);
    }
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(logs, null, 2));
  } catch (e) { next(e); }
}

module.exports = { getLogs, exportLogs };
