class TwilioSmsProvider {
  constructor(config) {
    this.name = "twilio";
    this.channel = "sms";
    const twilio = require("twilio");
    this.client = twilio(config.accountSid, config.authToken);
    this.from = config.from; // Twilio phone number
  }

  async send({ to, body }) {
    const msg = await this.client.messages.create({
      body,
      from: this.from,
      to
    });
    return { messageId: msg.sid, provider: this.name, channel: "sms" };
  }

  async verify() {
    try {
      await this.client.api.accounts(this.client.accountSid).fetch();
      return true;
    } catch { return false; }
  }
}

module.exports = TwilioSmsProvider;
