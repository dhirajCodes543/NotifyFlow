const ALLOWED_CHANNELS = ["email", "sms", "push"];

export const CHANNEL_QUEUE_MAP = {
  email: "email-queue",
  sms: "sms-queue",
  push: "push-queue",
};

export function processNotification(data) {
  const { userId, title, message, channels } = data;

  if (!userId || !title || !message || !Array.isArray(channels) || channels.length === 0) {
    throw new Error("missing required fields");
  }

  const normalizedChannels = [...new Set(channels)].filter((channel) =>
    ALLOWED_CHANNELS.includes(channel)
  );

  if (normalizedChannels.length === 0) {
    throw new Error("no valid channels provided");
  }

  const now = Date.now();
  const notificationId = `notif_${now}`;

  const events = normalizedChannels.map((channel, index) => ({
    eventId: `event_${channel}_${now}_${index + 1}`,
    channel,
    queueName: CHANNEL_QUEUE_MAP[channel],
    status: "pending",
  }));

  return {
    notificationId,
    userId,
    title,
    message,
    events,
  };
}