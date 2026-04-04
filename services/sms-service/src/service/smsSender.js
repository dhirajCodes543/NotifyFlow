import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function sendSms({ message, event }) {
  const recipient = event.recipient;

  if (!recipient) {
    throw new Error("sms recipient missing");
  }

  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: recipient,
  });

  return result;
}