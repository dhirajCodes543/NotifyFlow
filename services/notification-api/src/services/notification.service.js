import prisma from "../config/prisma.js";
import { renderTemplate } from "../clients/template.client.js";

const ALLOWED_CHANNELS = ["email", "sms", "push", "whatsapp"];

export const CHANNEL_QUEUE_MAP = {
  EMAIL: "email-queue",
  SMS: "sms-queue",
  PUSH: "push-queue",
  WHATSAPP: "whatsapp-queue",
};

const CHANNEL_DB_MAP = {
  email: "EMAIL",
  sms: "SMS",
  push: "PUSH",
  whatsapp: "WHATSAPP",
};

function normalizeChannels(channels) {
  return [...new Set(channels.map((channel) => channel.toLowerCase()))].filter(
    (channel) => ALLOWED_CHANNELS.includes(channel)
  );
}

function validateBaseFields({ userId, channels, recipients }) {
  if (
    !userId ||
    !Array.isArray(channels) ||
    channels.length === 0 ||
    !recipients ||
    typeof recipients !== "object"
  ) {
    throw new Error("userId, channels, and recipients are required");
  }
}

function validateRecipients(normalizedChannels, recipients) {
  for (const channel of normalizedChannels) {
    if (!recipients[channel]) {
      throw new Error(`recipient missing for channel: ${channel}`);
    }
  }
}

async function buildTemplateModeEvents({
  templateName,
  normalizedChannels,
  recipients,
  variables,
}) {
  return Promise.all(
    normalizedChannels.map(async (channel) => {
      const rendered = await renderTemplate({
        name: templateName,
        channel: channel.toUpperCase(),
        variables,
      });

      return {
        dbChannel: CHANNEL_DB_MAP[channel],
        queueName: CHANNEL_QUEUE_MAP[CHANNEL_DB_MAP[channel]],
        recipient: recipients[channel],
        title: rendered.title || null,
        message: rendered.message,
      };
    })
  );
}

function buildDirectModeEvents({
  title = null,
  message,
  normalizedChannels,
  recipients,
}) {
  return normalizedChannels.map((channel) => ({
    dbChannel: CHANNEL_DB_MAP[channel],
    queueName: CHANNEL_QUEUE_MAP[CHANNEL_DB_MAP[channel]],
    recipient: recipients[channel],
    title,
    message,
  }));
}

export async function processNotification(data) {
  const {
    userId,
    templateName,
    title,
    message,
    channels,
    recipients,
    variables = {},
  } = data;

  validateBaseFields({ userId, channels, recipients });

  const normalizedChannels = normalizeChannels(channels);

  if (normalizedChannels.length === 0) {
    throw new Error("no valid channels provided");
  }

  validateRecipients(normalizedChannels, recipients);

  const isTemplateMode = !!templateName;
  const isDirectMode = !templateName && !!message;

  if (!isTemplateMode && !isDirectMode) {
    throw new Error("provide either templateName or direct message content");
  }

  let preparedEvents = [];

  if (isTemplateMode) {
    preparedEvents = await buildTemplateModeEvents({
      templateName,
      normalizedChannels,
      recipients,
      variables,
    });
  } else {
    preparedEvents = buildDirectModeEvents({
      title,
      message,
      normalizedChannels,
      recipients,
    });
  }

  const notificationTitle =
    preparedEvents[0].title || title || templateName || "Notification";
  const notificationMessage = preparedEvents[0].message;

  const result = await prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: {
        userId,
        title: notificationTitle,
        message: notificationMessage,
        status: "PENDING",
      },
    });

    const createdEvents = [];

    for (const prepared of preparedEvents) {
      const event = await tx.notificationEvent.create({
        data: {
          notificationId: notification.id,
          channel: prepared.dbChannel,
          recipient: prepared.recipient,
          status: "PENDING",
        },
      });

      createdEvents.push({
        eventId: event.id,
        channel: event.channel,
        recipient: event.recipient,
        queueName: prepared.queueName,
        status: event.status,
        title: prepared.title,
        message: prepared.message,
      });
    }

    return {
      notification,
      events: createdEvents,
    };
  });

  return {
    notificationId: result.notification.id,
    userId: result.notification.userId,
    status: result.notification.status,
    events: result.events,
  };
}