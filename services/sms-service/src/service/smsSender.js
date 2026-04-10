import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function sendSms({ message, event }) {
  try {
    const recipient = event.recipient;

    if (!recipient) {
      throw new Error("SMS recipient missing");
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipient,
    });

    if (!response?.sid) {
      throw new Error("Twilio did not return a message SID");
    }

    if (response.status === "failed" || response.status === "undelivered") {
      throw new Error(`Twilio message failed with status: ${response.status}`);
    }

    return response;

  } catch (err) {
    throw new Error(`SMS send failed: ${err.message}`);
  }
}