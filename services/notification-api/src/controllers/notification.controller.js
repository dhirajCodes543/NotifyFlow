import { processNotification } from "../services/notification.service.js";
import { emailQueue, smsQueue, pushQueue } from "../queues/notification.queues.js";

const queueMap = {
  "email-queue": emailQueue,
  "sms-queue": smsQueue,
  "push-queue": pushQueue,
};

export async function createNotification(req, res) {
  try {
    const result = processNotification(req.body);

    for (const event of result.events) {
      const queue = queueMap[event.queueName];

      await queue.add("send-notification", {
        notificationId: result.notificationId,
        userId: result.userId,
        title: result.title,
        message: result.message,
        event,
      });
    }

    res.status(201).json({
      success: true,
      message: "notification queued successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}