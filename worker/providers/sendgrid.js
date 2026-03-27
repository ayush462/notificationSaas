class SendGridProvider {
  constructor(config) {
    this.name = "sendgrid";
    this.sgMail = require("@sendgrid/mail");
    this.sgMail.setApiKey(config.apiKey);
    this.from = config.from || "noreply@example.com";
  }

  async send({ to, subject, body, html }) {
    const [response] = await this.sgMail.send({
      to,
      from: this.from,
      subject,
      text: body,
      html: html || undefined,
      headers: { "X-Mailer": "NotifyStack/1.0" }
    });
    return { messageId: response?.headers?.["x-message-id"] || "sg_sent", provider: this.name };
  }

  async verify() { return true; }
}

module.exports = SendGridProvider;
