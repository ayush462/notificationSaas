/**
 * NotifyStack — Premium HTML Email Templates
 *
 * Wraps plain-text notification content into beautiful, responsive HTML emails.
 * Compatible with all major email clients (Gmail, Outlook, Apple Mail, Yahoo).
 */

const EVENT_ICONS = {
  USER_LOGIN: "🔐",
  USER_SIGNUP: "🎉",
  ORDER_PLACED: "🛒",
  PASSWORD_RESET: "🔑",
  PAYMENT_FAILED: "💳",
  SUBSCRIPTION_RENEWED: "✨",
  SHIPPING_UPDATE: "📦",
  INVITE_ACCEPTED: "🤝",
  REPORT_READY: "📊",
  ACCOUNT_SUSPENDED: "⚠️",
  TWO_FACTOR_CODE: "🔒"
};

const EVENT_COLORS = {
  USER_LOGIN: { primary: "#0a0a0a", accent: "#3b82f6", bg: "#eff6ff" },
  USER_SIGNUP: { primary: "#0a0a0a", accent: "#10b981", bg: "#ecfdf5" },
  ORDER_PLACED: { primary: "#0a0a0a", accent: "#8b5cf6", bg: "#f5f3ff" },
  PASSWORD_RESET: { primary: "#0a0a0a", accent: "#f59e0b", bg: "#fffbeb" },
  PAYMENT_FAILED: { primary: "#0a0a0a", accent: "#ef4444", bg: "#fef2f2" },
  ACCOUNT_SUSPENDED: { primary: "#0a0a0a", accent: "#ef4444", bg: "#fef2f2" }
};

const DEFAULT_COLORS = { primary: "#0a0a0a", accent: "#0a0a0a", bg: "#fafafa" };

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtml(text) {
  return escapeHtml(text)
    .replace(/\n\n/g, '</p><p style="margin:0 0 16px 0;line-height:1.7;color:#374151;">')
    .replace(/\n/g, "<br>");
}

function detectCtaLink(body) {
  const urlMatch = body.match(/(https?:\/\/[^\s]+)/);
  if (!urlMatch) return null;
  const url = urlMatch[1];
  const lower = body.toLowerCase();
  let label = "Click Here";
  if (lower.includes("reset")) label = "Reset Password";
  else if (lower.includes("verify")) label = "Verify Email";
  else if (lower.includes("confirm")) label = "Confirm Now";
  else if (lower.includes("view") || lower.includes("report")) label = "View Report";
  else if (lower.includes("track")) label = "Track Order";
  else if (lower.includes("appeal")) label = "Submit Appeal";
  return { url, label };
}

/**
 * Build a premium HTML email from notification data.
 *
 * @param {object} params
 * @param {string} params.subject
 * @param {string} params.body - Plain text body
 * @param {string} [params.eventName] - Event name for styling
 * @param {string} [params.recipientEmail]
 * @returns {string} Full HTML email
 */
function buildHtmlEmail({ subject, body, eventName, recipientEmail }) {
  const colors = EVENT_COLORS[eventName] || DEFAULT_COLORS;
  const icon = EVENT_ICONS[eventName] || "📧";
  const bodyHtml = textToHtml(body);
  const cta = detectCtaLink(body);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; display: block; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f5f5f5; padding: 40px 0; }
    .main { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    @media only screen and (max-width: 620px) {
      .main { margin: 0 12px !important; border-radius: 12px !important; }
      .content-pad { padding: 28px 24px !important; }
      .header-pad { padding: 28px 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div class="wrapper" style="width:100%;table-layout:fixed;background-color:#f5f5f5;padding:40px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
      <tr>
        <td>
          <!-- Main card -->
          <table role="presentation" class="main" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

            <!-- Header -->
            <tr>
              <td class="header-pad" style="padding:36px 40px 24px 40px;border-bottom:1px solid #f0f0f0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:44px;height:44px;background:${colors.primary};border-radius:12px;text-align:center;vertical-align:middle;font-size:20px;line-height:44px;">
                            <span style="color:#ffffff;">N</span>
                          </td>
                          <td style="padding-left:14px;">
                            <p style="margin:0;font-size:18px;font-weight:700;color:${colors.primary};letter-spacing:-0.3px;">NotifyStack</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="text-align:right;vertical-align:middle;">
                      <span style="display:inline-block;background:${colors.bg};border-radius:20px;padding:6px 14px;font-size:11px;font-weight:600;color:${colors.accent};letter-spacing:0.5px;text-transform:uppercase;">
                        ${icon} ${escapeHtml(eventName || "Notification")}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Subject banner -->
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <h1 style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:#0a0a0a;line-height:1.3;letter-spacing:-0.3px;">
                  ${escapeHtml(subject)}
                </h1>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:16px 40px 0 40px;">
                <div style="height:3px;border-radius:2px;background:linear-gradient(90deg, ${colors.accent}, ${colors.accent}33);"></div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="content-pad" style="padding:24px 40px 12px 40px;">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151;">
                  ${bodyHtml}
                </p>
              </td>
            </tr>

            ${cta ? `
            <!-- CTA Button -->
            <tr>
              <td style="padding:8px 40px 28px 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${colors.accent};border-radius:10px;">
                      <a href="${escapeHtml(cta.url)}" target="_blank"
                        style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                        ${escapeHtml(cta.label)} →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:12px 0 0 0;font-size:11px;color:#9ca3af;line-height:1.5;">
                  Or copy this link: <a href="${escapeHtml(cta.url)}" style="color:${colors.accent};word-break:break-all;">${escapeHtml(cta.url)}</a>
                </p>
              </td>
            </tr>
            ` : ""}

            <!-- Security note -->
            <tr>
              <td style="padding:0 40px 28px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:10px;border:1px solid #f0f0f0;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                        🔒 This email was sent by <strong>NotifyStack</strong>. If you didn't expect this, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 40px;background:#fafafa;border-top:1px solid #f0f0f0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                        Sent via <strong style="color:#6b7280;">NotifyStack</strong> • ${year}
                      </p>
                      ${recipientEmail ? `<p style="margin:4px 0 0 0;font-size:11px;color:#d1d5db;">To: ${escapeHtml(recipientEmail)}</p>` : ""}
                    </td>
                    <td style="text-align:right;vertical-align:top;">
                      <p style="margin:0;font-size:10px;color:#d1d5db;letter-spacing:1px;font-weight:600;">AUTOMATED</p>
                      ${recipientEmail ? `<p style="margin:8px 0 0 0;font-size:10px;"><a href="${process.env.APP_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color:#d1d5db;text-decoration:underline;">Unsubscribe</a></p>` : ""}
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

module.exports = { buildHtmlEmail };
