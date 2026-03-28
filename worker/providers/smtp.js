const nodemailer = require("nodemailer");

class SmtpProvider {
  constructor(config) {
    this.name = "smtp";
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      dnsLookup: (hostname, options, callback) => {
        require("dns").lookup(hostname, { family: 4 }, callback);
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // DKIM signing (if configured)
      ...(config.dkim ? {
        dkim: {
          domainName: config.dkim.domain,
          keySelector: config.dkim.selector || "default",
          privateKey: config.dkim.privateKey
        }
      } : {})
    });
    this.from = config.from || "noreply@example.com";
  }

  async send({ to, subject, body, html }) {
    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text: body,
      html: html || undefined,
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@${this.from.split("@")[1] || "example.com"}>`,
        "X-Mailer": "NotifyStack/1.0"
      }
    });
    return { messageId: info.messageId, provider: this.name };
  }

  async verify() {
    try {
      await this.transporter.verify();
      return true;
    } catch { return false; }
  }
}

module.exports = SmtpProvider;
