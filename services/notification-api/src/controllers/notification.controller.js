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

export async function sendNotification(req, res) {
  try {
    const idempotencyKey = req.headers["idempotency-key"];

    if (idempotencyKey) {
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existing) {
        return res.status(200).json(existing.response);
      }
    }

    const result = await processNotification(req.body);

    for (const event of result.events) {
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
      } catch (queueErr) {
        await prisma.notificationEvent.update({
          where: { id: event.eventId },
          data: {
            status: "FAILED",
            errorMessage: `Queue add failed: ${queueErr.message}`,
          },
        });

        await updateNotificationStatus(result.notificationId);
      }
    }

    await updateNotificationStatus(result.notificationId);

    const responsePayload = {
      message: "notification queued",
      notificationId: result.notificationId,
    };

    if (idempotencyKey) {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          response: responsePayload,
        },
      });
    }

    return res.status(201).json(responsePayload);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
}