const nodemailer = require('nodemailer');

function mailConfig() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '');
  const from = String(process.env.MAIL_FROM || user || 'GoldnSilver <noreply@goldnsilver.shop>').trim();
  const secure = String(process.env.SMTP_SECURE || '').trim() === '1' || port === 465;
  return { host, port, user, pass, from, secure };
}

function assertMailConfigured() {
  const config = mailConfig();
  if (!config.host || !config.user || !config.pass) {
    const err = new Error(
      'Email verification is not configured yet. Add SMTP_HOST, SMTP_USER, and SMTP_PASS in the backend env, then restart the API.'
    );
    err.statusCode = 503;
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }
  return config;
}

async function sendMail({ to, subject, text, html }) {
  const config = assertMailConfigured();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });
  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html
  });
}

async function sendLoginCode(email, code) {
  const safeCode = String(code || '').replace(/[^\d]/g, '');
  await sendMail({
    to: email,
    subject: 'Your GoldnSilver verification code',
    text: `Your GoldnSilver verification code is ${safeCode}. It expires in 10 minutes. Press and hold the code to copy it.`,
    html: `
      <div style="font-family:Georgia,serif;background:#f7f5f2;padding:24px;color:#3d3428">
        <div style="background:#ffffff;border:1px solid #efe6d4;border-radius:16px;padding:22px 20px">
          <h1 style="font-size:22px;margin:0 0 8px;color:#5c4a32">GoldnSilver.shop</h1>
          <p style="margin:0 0 16px;color:#6d6458">Use this code to continue. It expires in 10 minutes.</p>
          <p style="margin:0 0 10px;background:#fffdf8;border:1px solid #ead9a2;border-radius:12px;padding:16px 12px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:700;font-family:Consolas,Courier,monospace;color:#2b2118">
            <span style="user-select:all;-webkit-user-select:all;-moz-user-select:all">${safeCode}</span>
          </p>
          <p style="font-size:13px;color:#8a8176;margin:0 0 16px">Press and hold the code, then choose Copy. Inbox apps block a copy button, so the numbers themselves are what you copy.</p>
          <p style="font-size:13px;color:#8a8176;margin:0">If you did not ask for this code, you can ignore this email.</p>
        </div>
      </div>
    `
  });
}

module.exports = { sendMail, sendLoginCode, assertMailConfigured };
