import prisma from "../config/prisma.js";
import sendEmail from "../service/emailSender.js";
import updateNotificationStatus from "../service/notificationStatus.service.js";
import { failedEmailQueue } from "../queues/dlq-email.js";

export default async function processEmailJob(job) {
  const { event, notificationId, title, message, userId } = job.data;

  try {
    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: { status: "PROCESSING" },
    });

    const emailResult = await sendEmail({
      userId,
      title,
      message,
      event,
    });

    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: {
        status: "SUCCESS",
        providerMessageId: emailResult?.data?.id ?? emailResult?.id ?? null,
        errorMessage: null,
      },
    });

    await updateNotificationStatus(notificationId);
  } catch (err) {
    const isLastAttempt = job.attemptsMade + 1 >= job.opts.attempts;

    if (isLastAttempt) {
      try {
        await prisma.notificationEvent.update({
          where: { id: event.eventId },
          data: {
            status: "FAILED",
            errorMessage: err.message,
          },
        });

        await failedEmailQueue.add("failed-email", {
          originalJobId: job.id,
          eventId: event.eventId,
          notificationId,
          channel: event.channel,
          recipient: event.recipient,
          userId,
          title,
          message,
          errorMessage: err.message,
          failedAt: new Date().toISOString(),
        });

        await updateNotificationStatus(notificationId);
      } catch (dbErr) {
        console.error("FAILED STATUS UPDATE ERROR:", dbErr);
      }
    }

    throw err;
  }
}