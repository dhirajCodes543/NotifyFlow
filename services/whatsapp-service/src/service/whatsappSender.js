import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function sendWhatsapp({ message, event }) {
  const response = await client.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: event.recipient,
  });

  if (!response?.sid) {
    throw new Error("Twilio did not return a message SID");
  }

  return response;
}