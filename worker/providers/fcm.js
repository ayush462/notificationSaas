class FcmPushProvider {
  constructor(config) {
    this.name = "fcm";
    this.channel = "push";
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          typeof config.serviceAccount === "string"
            ? JSON.parse(config.serviceAccount)
            : config.serviceAccount
        )
      });
    }
    this.messaging = admin.messaging();
  }

  async send({ to, subject, body, data }) {
    // `to` is a device token or topic
    const message = {
      notification: { title: subject, body },
      data: data || {},
      ...(to.startsWith("/topics/")
        ? { topic: to.replace("/topics/", "") }
        : { token: to })
    };
    const response = await this.messaging.send(message);
    return { messageId: response, provider: this.name, channel: "push" };
  }

  async verify() { return true; }
}

module.exports = FcmPushProvider;
