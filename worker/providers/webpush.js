const webpush = require("web-push");

class WebPushProvider {
  constructor(config) {
    this.name = "webpush";
    this.channel = "push";
    webpush.setVapidDetails(
      config.subject || "mailto:admin@example.com",
      config.publicKey,
      config.privateKey
    );
  }

  async send({ to, subject, body, data }) {
    // `to` is a JSON stringified PushSubscription
    const subscription = typeof to === "string" ? JSON.parse(to) : to;
    const payload = JSON.stringify({
      title: subject,
      body,
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      data: data || {},
      timestamp: Date.now()
    });
    const result = await webpush.sendNotification(subscription, payload);
    return { messageId: `wp_${Date.now()}`, provider: this.name, channel: "push", statusCode: result.statusCode };
  }

  async verify() { return true; }
}

module.exports = WebPushProvider;
