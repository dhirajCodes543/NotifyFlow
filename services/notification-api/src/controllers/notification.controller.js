import { processNotification } from "../services/notification.service.js";
import { emailQueue, smsQueue, pushQueue } from "../queues/notification.queues.js";

const JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

export async function sendNotification(req, res) {
  try {
    const result = await processNotification(req.body);

    for (const event of result.events) {
      const jobData = {
        notificationId: result.notificationId,
        userId: result.userId,
        title: result.title,
        message: result.message,
        event,
      };

      if (event.queueName === "email-queue") {
        await emailQueue.add("send-email", jobData, {
          ...JOB_OPTIONS,
          jobId: event.eventId,
        });
      } else if (event.queueName === "sms-queue") {
        await smsQueue.add("send-sms", jobData, {
          ...JOB_OPTIONS,
          jobId: event.eventId,
        });
      } else if (event.queueName === "push-queue") {
        await pushQueue.add("send-push", jobData, {
          ...JOB_OPTIONS,
          jobId: event.eventId,
        });
      }
    }

    res.status(201).json({
      message: "notification queued",
      notificationId: result.notificationId,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
}