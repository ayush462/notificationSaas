const nodemailer = require("nodemailer");
const config = require("../config");

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false, // IMPORTANT for 587
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

async function sendEmail(data) {
  await transporter.sendMail({
    from: config.smtp.from,
    to: data.recipientEmail,
    subject: data.subject,
    text: data.body
  });
}

module.exports = { sendEmail };
