import nodemailer from "nodemailer";

/**
 * Sends contact emails using Nodemailer.
 * Returns granular status for each email.
 */
export async function sendContactEmails({ name, email, subject, message }) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SUPPORT_EMAIL = "ipl.live1003@gmail.com",
  } = process.env;

  const status = {
    supportEmailSent: false,
    confirmationEmailSent: false,
    error: null
  };

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("❌ SMTP configuration missing in .env");
    status.error = "SMTP not configured";
    return status;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    // 1. Verify connection
    console.log("📡 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    // 2. Send notification to Support (MANDATORY for 'success')
    const adminMailOptions = {
      from: `"IPL LIVE Support" <${SMTP_USER}>`,
      to: SUPPORT_EMAIL,
      subject: `New Support Request: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #00f2ff;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">Submitted via IPL LIVE Futuristic Platform</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(adminMailOptions);
      status.supportEmailSent = true;
      console.log(`✅ Support email sent to ${SUPPORT_EMAIL}`);
    } catch (err) {
      console.error("❌ Support email failed:", err.message);
      status.error = `Support email failed: ${err.message}`;
      return status; // Stop here if support email fails
    }

    // 3. Send confirmation to User (OPTIONAL for 'success')
    const userMailOptions = {
      from: `"IPL LIVE Support" <${SMTP_USER}>`,
      to: email,
      subject: `We've received your message: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #00f2ff;">Hello ${name},</h2>
          <p>Thank you for reaching out to IPL LIVE Support. We have received your message regarding "<strong>${subject}</strong>".</p>
          <p>Our team will review your inquiry and get back to you as soon as possible.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <p style="font-style: italic; color: #555;">"Your message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</p>
          </div>
          <p>Best regards,<br/>The IPL LIVE Team</p>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">This is an automated response. Please do not reply to this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(userMailOptions);
      status.confirmationEmailSent = true;
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (err) {
      console.warn("⚠️ Confirmation email failed (continuing as success):", err.message);
      // We don't return here because support already received the message
    }

    return status;
  } catch (error) {
    console.error("❌ SMTP Error:", error.message);
    status.error = error.message;
    return status;
  }
}
