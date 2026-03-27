require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const auditLogger = require("./middleware/auditLogger");

const notificationRoutes = require("./routes/notificationRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const logRoutes = require("./routes/logRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use(auditLogger);

app.get("/health", (req, res) => res.json({ ok: true, service: "api" }));
app.use("/v1/notifications", notificationRoutes);
app.use("/v1/apikeys", apiKeyRoutes);
app.use("/v1/logs", logRoutes);
app.use("/v1/email", emailRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API listening on ${config.port}`);
});
