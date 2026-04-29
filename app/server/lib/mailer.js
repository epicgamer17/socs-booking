// app/server/lib/mailer.js
// Author: Claude
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Fire-and-forget by default — never block the response on SMTP.
// Returns a promise so callers can `await` if they want delivery confirmation.
async function sendNotification({ to, subject, text, replyTo }) {
  try {
    await transporter.sendMail({
      from: `"myBookings" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(replyTo && { replyTo }),
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer.sendNotification]", err);
    return { ok: false, error: err.message };
  }
}

module.exports = { transporter, sendNotification };
