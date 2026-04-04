import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail({ title, message, event }) {
  const recipient = event.recipient;

  if (!recipient) {
    throw new Error("email recipient missing");
  }

  const response = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: recipient,
    subject: title,
    html: `<p>${message}</p>`,
  });

  return response;
}