import { Resend } from "resend";

/**
 * Sends contact emails using Resend API.
 * Returns granular status for each email.
 */
export async function sendContactEmails({ name, email, subject, message }) {
  const {
    RESEND_API_KEY,
    SUPPORT_EMAIL = "ipl.live1003@gmail.com",
  } = process.env;

  const status = {
    supportEmailSent: false,
    confirmationEmailSent: false,
    error: null
  };

  if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY configuration missing in .env");
    status.error = "Email service not configured";
    return status;
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // 1. Send notification to Support (MANDATORY for 'success')
    console.log(`📡 Sending support email to ${SUPPORT_EMAIL} via Resend...`);
    const { data: supportData, error: supportError } = await resend.emails.send({
      from: "IPL LIVE Support <onboarding@resend.dev>",
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
    });

    if (supportError) {
      console.error("❌ Support email failed:", supportError.message);
      status.error = `Support email failed: ${supportError.message}`;
      return status;
    }

    status.supportEmailSent = true;
    console.log(`✅ Support email sent successfully: ${supportData.id}`);

    // 2. Send confirmation to User (OPTIONAL for 'success')
    // Note: Resend free tier might limit sending to non-verified emails.
    // We attempt it but don't fail the whole process if it fails.
    try {
      console.log(`📡 Sending confirmation email to ${email} via Resend...`);
      const { error: userError } = await resend.emails.send({
        from: "IPL LIVE Support <onboarding@resend.dev>",
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
      });

      if (!userError) {
        status.confirmationEmailSent = true;
        console.log(`✅ Confirmation email sent to ${email}`);
      } else {
        console.warn("⚠️ Confirmation email skipped/failed:", userError.message);
      }
    } catch (err) {
      console.warn("⚠️ Confirmation email exception:", err.message);
    }

    return status;
  } catch (err) {
    console.error("❌ Unexpected Email Service Error:", err.message);
    status.error = err.message;
    return status;
  }
}
