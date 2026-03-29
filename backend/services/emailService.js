import { Resend } from "resend";

/**
 * Sends contact emails using Resend API.
 * Returns granular status for each email.
 */
export async function sendContactEmails({ name, email, subject, message }) {
  const {
    RESEND_API_KEY,
    SUPPORT_EMAIL = "mhmdshazbadr06@gmail.com",
  } = process.env;

  const status = {
    supportEmailSent: false,
    error: null
  };

  if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY configuration missing in .env");
    status.error = "Email service not configured";
    return status;
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // 1. Send notification to Support (MANDATORY)
    console.log(`📡 Sending support email to ${SUPPORT_EMAIL} via Resend...`);
    const { data: supportData, error: supportError } = await resend.emails.send({
      from: "IPL LIVE Support <onboarding@resend.dev>",
      to: SUPPORT_EMAIL,
      reply_to: email,
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    if (supportError) {
      console.error("❌ Support email failed:", supportError.message);
      status.error = `Support email failed: ${supportError.message}`;
      return status;
    }

    status.supportEmailSent = true;
    console.log(`✅ Support email sent successfully: ${supportData.id}`);

    return status;
  } catch (err) {
    console.error("❌ Unexpected Email Service Error:", err.message);
    status.error = err.message;
    return status;
  }
}
