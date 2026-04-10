import { processNotification } from "../services/notification.service.js";
import {
  emailQueue,
  smsQueue,
  pushQueue,
  whatsappQueue,
} from "../queues/notification.queues.js";
import prisma from "../config/prisma.js";
import updateNotificationStatus from "../services/notificationStatus.service.js";

const JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addJobWithRetry(queue, jobName, jobData, options, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await queue.add(jobName, jobData, options);
    } catch (err) {
      lastError = err;

      if (attempt < maxAttempts) {
        await sleep(attempt * 1000);
      }
    }
  }

  throw lastError;
}

async function enqueueSingleEvent(event, result) {
  const jobData = {
    notificationId: result.notificationId,
    userId: result.userId,
    title: event.title,
    message: event.message,
    event,
  };

  try {
    if (event.queueName === "email-queue") {
      await addJobWithRetry(emailQueue, "send-email", jobData, {
        ...JOB_OPTIONS,
        jobId: event.eventId,
      });
    } else if (event.queueName === "sms-queue") {
      await addJobWithRetry(smsQueue, "send-sms", jobData, {
        ...JOB_OPTIONS,
        jobId: event.eventId,
      });
    } else if (event.queueName === "push-queue") {
      await addJobWithRetry(pushQueue, "send-push", jobData, {
        ...JOB_OPTIONS,
        jobId: event.eventId,
      });
    } else if (event.queueName === "whatsapp-queue") {
      await addJobWithRetry(whatsappQueue, "send-whatsapp", jobData, {
        ...JOB_OPTIONS,
        jobId: event.eventId,
      });
    } else {
      throw new Error(`Unknown queue name: ${event.queueName}`);
    }

    return {
      eventId: event.eventId,
      channel: event.channel,
      status: "QUEUED",
    };
  } catch (queueErr) {
    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: {
        status: "FAILED",
        errorMessage: `Queue add failed: ${queueErr.message}`,
      },
    });

    await updateNotificationStatus(result.notificationId);

    return {
      eventId: event.eventId,
      channel: event.channel,
      status: "FAILED",
      reason: "QUEUE_ADD_FAILED",
    };
  }
}

export async function sendNotification(req, res) {
  try {
    const result = await processNotification(req.body);

    const queueResults = await Promise.all(
      result.events.map((event) => enqueueSingleEvent(event, result))
    );

    await updateNotificationStatus(result.notificationId);

    const skippedResults = result.allEvents
      .filter((event) => event.status === "SKIPPED")
      .map((event) => ({
        eventId: event.eventId,
        channel: event.channel,
        status: "SKIPPED",
        ...(event.skipReason && { reason: event.skipReason }),
      }));

    const channelResults = [...queueResults, ...skippedResults];

    const queuedCount = channelResults.filter(
      (event) => event.status === "QUEUED"
    ).length;

    const skippedCount = channelResults.filter(
      (event) => event.status === "SKIPPED"
    ).length;

    const failedCount = channelResults.filter(
      (event) => event.status === "FAILED"
    ).length;

    const responsePayload = {
      message: "notification processed",
      notificationId: result.notificationId,
      summary: {
        queuedCount,
        skippedCount,
        failedCount,
      },
      channels: channelResults,
    };

    if (req.idempotencyKey) {
      await prisma.idempotencyKey.update({
        where: { key: req.idempotencyKey },
        data: {
          status: "COMPLETED",
          response: responsePayload,
        },
      });
    }

    return res.status(201).json(responsePayload);
  } catch (err) {
    if (req.idempotencyKey) {
      await prisma.idempotencyKey.deleteMany({
        where: { key: req.idempotencyKey, status: "PROCESSING" },
      });
    }

    return res.status(400).json({
      error: err.message,
    });
  }
}