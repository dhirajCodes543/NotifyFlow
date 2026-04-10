import prisma from "../config/prisma.js";
import sendWhatsapp from "../service/whatsappSender.js";
import updateNotificationStatus from "../service/notificationStatus.service.js";
import { failedWhatsappQueue } from "../queues/dlq-whatsapp.js";

export default async function processWhatsappJob(job) {
  const { event, notificationId, title, message, userId } = job.data;

  try {
    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: { status: "PROCESSING" },
    });

    const whatsappResult = await sendWhatsapp({
      message,
      event,
    });

    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: {
        status: "SUCCESS",
        providerMessageId: whatsappResult?.sid ?? null,
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

        await failedWhatsappQueue.add("failed-whatsapp", {
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