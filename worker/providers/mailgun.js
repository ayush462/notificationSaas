class MailgunProvider {
  constructor(config) {
    this.name = "mailgun";
    const Mailgun = require("mailgun.js");
    const FormData = require("form-data");
    const mg = new Mailgun(FormData);
    this.client = mg.client({ username: "api", key: config.apiKey });
    this.domain = config.domain;
    this.from = config.from || `noreply@${config.domain}`;
  }

  async send({ to, subject, body, html }) {
    const result = await this.client.messages.create(this.domain, {
      from: this.from,
      to: [to],
      subject,
      text: body,
      html: html || undefined,
      "h:X-Mailer": "NotifyStack/1.0"
    });
    return { messageId: result.id || "mg_sent", provider: this.name };
  }

  async verify() { return true; }
}

module.exports = MailgunProvider;
