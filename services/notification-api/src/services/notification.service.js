import prisma from "../config/prisma.js";

const ALLOWED_CHANNELS = ["email", "sms", "push"];

export const CHANNEL_QUEUE_MAP = {
  EMAIL: "email-queue",
  SMS: "sms-queue",
  PUSH: "push-queue",
};

const CHANNEL_DB_MAP = {
  email: "EMAIL",
  sms: "SMS",
  push: "PUSH",
};

export async function processNotification(data) {
  const { userId, title, message, channels } = data;

  if (
    !userId ||
    !title ||
    !message ||
    !Array.isArray(channels) ||
    channels.length === 0
  ) {
    throw new Error("missing required fields");
  }

  const normalizedChannels = [...new Set(channels)].filter((channel) =>
    ALLOWED_CHANNELS.includes(channel)
  );

  if (normalizedChannels.length === 0) {
    throw new Error("no valid channels provided");
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      status: "PENDING",
    },
  });

  const eventData = normalizedChannels.map((channel) => ({
    notificationId: notification.id,
    channel: CHANNEL_DB_MAP[channel],
    status: "PENDING",
  }));

  await prisma.notificationEvent.createMany({
    data: eventData,
  });

  const savedEvents = await prisma.notificationEvent.findMany({
    where: {
      notificationId: notification.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const events = savedEvents.map((event) => ({
    eventId: event.id,
    channel: event.channel,
    queueName: CHANNEL_QUEUE_MAP[event.channel],
    status: event.status,
  }));

  return {
    notificationId: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    status: notification.status,
    events,
  };
}