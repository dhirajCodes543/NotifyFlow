import prisma from "../config/prisma.js";
import sendSms from "../service/smsSender.js";
import updateNotificationStatus from "../service/notificationStatus.service.js";

export default async function processSmsJob(job) {
  const { event, notificationId, message } = job.data;

  try {
    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: { status: "PROCESSING" },
    });

    const smsResult = await sendSms({
      message,
      event,
    });

    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: {
        status: "SUCCESS",
        providerMessageId: smsResult?.sid ?? null,
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

        await updateNotificationStatus(notificationId);
      } catch (dbErr) {
        console.error("FAILED STATUS UPDATE ERROR:", dbErr);
      }
    }

    throw err;
  }
}