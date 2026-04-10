import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail({ title, message, event }) {
  try {
    const recipient = event.recipient;

    if (!recipient) {
      throw new Error("email recipient missing");
    }

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: recipient,
      subject: title || "Notification",
      html: `<p>${message}</p>`,
    });

    if (!response || response.error) {
      throw new Error(
        response?.error?.message || "Resend email send failed"
      );
    }

    return response;

  } catch (err) {
    throw new Error(`Email send failed: ${err.message}`);
  }
}