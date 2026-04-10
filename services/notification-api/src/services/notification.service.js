import { randomUUID } from "crypto";
import prisma from "../config/prisma.js";
import { renderTemplate } from "../clients/template.client.js";
import {
  getOrCreateUserPreference,
  isChannelEnabled,
} from "./userPreference.service.js";
import { checkAndReserveFrequencyCap } from "./frequencyCap.service.js";

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

async function buildTemplateModeEvents({
  templateName,
  normalizedChannels,
  recipients,
  variables,
}) {
  const settledResults = await Promise.allSettled(
    normalizedChannels.map(async (channel) => {
      if (!recipients[channel]) {
        throw new Error(`recipient missing for channel: ${channel}`);
      }

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

  return settledResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

function buildDirectModeEvents({
  title = null,
  message,
  normalizedChannels,
  recipients,
}) {
  return normalizedChannels
    .filter((channel) => recipients[channel])
    .map((channel) => ({
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

  if (preparedEvents.length === 0) {
    throw new Error("no valid channels could be processed");
  }

  const preference = await getOrCreateUserPreference(userId);

  const evaluatedEvents = [];

  for (const prepared of preparedEvents) {
    const eventId = randomUUID();

    if (!isChannelEnabled(preference, prepared.dbChannel)) {
      evaluatedEvents.push({
        eventId,
        channel: prepared.dbChannel,
        recipient: prepared.recipient,
        queueName: prepared.queueName,
        status: "SKIPPED",
        skipReason: "CHANNEL_DISABLED",
        title: prepared.title,
        message: prepared.message,
      });
      continue;
    }

    const capResult = await checkAndReserveFrequencyCap({
      userId,
      channel: prepared.dbChannel,
      eventId,
    });

    if (!capResult.allowed) {
      evaluatedEvents.push({
        eventId,
        channel: prepared.dbChannel,
        recipient: prepared.recipient,
        queueName: prepared.queueName,
        status: "SKIPPED",
        skipReason: capResult.reason,
        title: prepared.title,
        message: prepared.message,
      });
      continue;
    }

    evaluatedEvents.push({
      eventId,
      channel: prepared.dbChannel,
      recipient: prepared.recipient,
      queueName: prepared.queueName,
      status: "PENDING",
      skipReason: null,
      title: prepared.title,
      message: prepared.message,
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

    for (const evaluated of evaluatedEvents) {
      const event = await tx.notificationEvent.create({
        data: {
          id: evaluated.eventId,
          notificationId: notification.id,
          channel: evaluated.channel,
          recipient: evaluated.recipient,
          status: evaluated.status,
          skipReason: evaluated.skipReason,
        },
      });

      createdEvents.push({
        eventId: event.id,
        channel: event.channel,
        recipient: event.recipient,
        queueName: evaluated.queueName,
        status: event.status,
        skipReason: event.skipReason,
        title: evaluated.title,
        message: evaluated.message,
      });
    }

    return {
      notification,
      events: createdEvents,
    };
  });

  const queueableEvents = result.events.filter(
    (event) => event.status === "PENDING"
  );

  return {
    notificationId: result.notification.id,
    userId: result.notification.userId,
    status: result.notification.status,
    events: queueableEvents,
    allEvents: result.events,
  };
}