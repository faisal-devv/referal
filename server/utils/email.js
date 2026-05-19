const { Resend } = require('resend');

const FROM = `Referus.co <${process.env.EMAIL_FROM || 'team@referus.co'}>`;

const send = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({ from: FROM, to, subject, html });
};

// ── Templates ──────────────────────────────────────────────────────────────────

const base = (content) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;padding:40px 0">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#1d4ed8;padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px">Referus</h1>
      <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px">The Global Lead Referral Platform</p>
    </div>
    <div style="padding:32px">
      ${content}
    </div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">© 2026 Referus. All rights reserved.</p>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:12px">
        <a href="https://referus.co" style="color:#1d4ed8;text-decoration:none">referus.co</a>
      </p>
    </div>
  </div>
</div>`;

const btn = (url, label) =>
  `<a href="${url}" style="display:inline-block;padding:12px 28px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:8px 0">${label}</a>`;

// ── Email functions ────────────────────────────────────────────────────────────

const sendWelcomeEmail = (email, name, userId) =>
  send({
    to: email,
    subject: 'Welcome to Referus — Your User ID',
    html: base(`
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Welcome, ${name}! 👋</h2>
      <p style="color:#475569;margin:0 0 20px">Your account is ready. Here's your unique User ID — keep it safe for support reference.</p>
      <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;text-align:center;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em">Your User ID</p>
        <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:.05em;color:#4f46e5">${userId}</p>
      </div>
      <p style="color:#475569;margin:0 0 8px">You can view your ID anytime on your profile page. Start submitting leads and earn commissions when deals close!</p>
      <p style="color:#475569;margin:0"><strong>— The Referus Team</strong></p>
    `),
  });

const sendPasswordResetEmail = (email, resetUrl) =>
  send({
    to: email,
    subject: 'Reset your Referus password',
    html: base(`
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Password Reset Request</h2>
      <p style="color:#475569;margin:0 0 20px">We received a request to reset your Referus account password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
      <p>${btn(resetUrl, 'Reset Password')}</p>
      <p style="color:#94a3b8;font-size:13px;margin:20px 0 0">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    `),
  });

const sendLeadStatusEmail = (email, name, companyName, status) => {
  const isDealClosed = status === 'Deal Closed';
  return send({
    to: email,
    subject: isDealClosed
      ? `🎉 Deal Closed — ${companyName}`
      : `Lead Update — ${companyName} is now "${status}"`,
    html: base(`
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">
        ${isDealClosed ? '🎉 Deal Closed!' : 'Lead Status Updated'}
      </h2>
      <p style="color:#475569;margin:0 0 20px">Hi ${name},</p>
      ${isDealClosed
        ? `<p style="color:#475569;margin:0 0 16px">Great news! Your lead for <strong>${companyName}</strong> has been marked as <strong style="color:#16a34a">Deal Closed</strong>. Your commission has been added to your wallet.</p>
           <p style="color:#475569;margin:0 0 20px">Log in to check your earnings and submit your withdrawal anytime.</p>`
        : `<p style="color:#475569;margin:0 0 16px">Your lead for <strong>${companyName}</strong> has been updated to <strong>${status}</strong>.</p>
           <p style="color:#475569;margin:0 0 20px">Log in to your dashboard to track progress.</p>`
      }
      <p>${btn('https://referus.co/leads', 'View My Leads')}</p>
    `),
  });
};

const sendWithdrawalEmail = (email, name, amount, currency, status) => {
  const isPending = status === 'pending';
  return send({
    to: email,
    subject: isPending
      ? `Withdrawal Request Received — ${amount} ${currency}`
      : `Withdrawal ${status === 'approved' ? 'Approved' : 'Update'} — ${amount} ${currency}`,
    html: base(`
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">
        ${isPending ? 'Withdrawal Request Received' : `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}`}
      </h2>
      <p style="color:#475569;margin:0 0 20px">Hi ${name},</p>
      ${isPending
        ? `<p style="color:#475569;margin:0 0 16px">We've received your withdrawal request for <strong>${amount} ${currency}</strong>. Processing takes 3–5 business days.</p>
           <p style="color:#475569;margin:0 0 20px">We'll notify you once it's processed.</p>`
        : `<p style="color:#475569;margin:0 0 20px">Your withdrawal of <strong>${amount} ${currency}</strong> has been <strong>${status}</strong>. Log in for details.</p>`
      }
      <p>${btn('https://referus.co/wallet', 'View Wallet')}</p>
    `),
  });
};

const sendOtpEmail = (email, name, otp) =>
  send({
    to: email,
    subject: 'Your Referus.co verification code',
    html: base(`
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Verify your email</h2>
      <p style="color:#475569;margin:0 0 20px">Hi ${name}, enter the 6-digit code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
      <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;text-align:center;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em">Verification Code</p>
        <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:.3em;color:#1d4ed8">${otp}</p>
      </div>
      <p style="color:#94a3b8;font-size:13px;margin:0">If you didn't create a Referus.co account, ignore this email.</p>
    `),
  });

const sendContactQueryEmail = (name, fromEmail, subject, message) =>
  send({
    to: process.env.EMAIL_FROM || 'team@referus.co',
    subject: `[Contact Form] ${subject}`,
    html: base(`
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">New Contact Form Submission</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:80px">From</td><td style="padding:8px 0;color:#0f172a;font-weight:600">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${fromEmail}" style="color:#1d4ed8">${fromEmail}</a></td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px">Subject</td><td style="padding:8px 0;color:#0f172a">${subject}</td></tr>
      </table>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px">
        <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em">Message</p>
        <p style="margin:0;color:#334155;white-space:pre-wrap">${message}</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">Reply directly to this email to respond to ${name}.</p>
    `),
  });

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendLeadStatusEmail, sendWithdrawalEmail, sendOtpEmail, sendContactQueryEmail };
