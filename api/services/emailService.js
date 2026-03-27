const { enqueueNotification } = require("./notificationService");
async function queueEmail(payload) { return enqueueNotification(payload); }
module.exports = { queueEmail };
