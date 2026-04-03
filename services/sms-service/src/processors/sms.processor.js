import prisma from "../config/prisma.js";
import sendSms from "../service/smsSender.js";
import updateNotificationStatus from "../service/notificationStatus.service.js";

export default async function processsmsJob(job) {
  const { event, notificationId, title, message, userId } = job.data;

  try {
    console.log("STEP 1: job picked");

    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: { status: "PROCESSING" },
    });
    console.log("STEP 2: set PROCESSING done");

    await sendSms({
      userId,
      title,
      message,
      event,
    });
    console.log("STEP 3: sendSms done");

    await prisma.notificationEvent.update({
      where: { id: event.eventId },
      data: { status: "SUCCESS" },
    });
    console.log("STEP 4: set SUCCESS done");

    await updateNotificationStatus(notificationId);
    console.log("STEP 5: notification status updated");

    console.log("sms job completed:", job.id);
  } catch (err) {
    console.error("sms WORKER ERROR:", err);
    console.error("sms WORKER ERROR MESSAGE:", err.message);

    const isLastAttempt = job.attemptsMade + 1 >= job.opts.attempts;

    if (isLastAttempt) {
      try {
        await prisma.notificationEvent.update({
          where: { id: event.eventId },
          data: { status: "FAILED" },
        });
        console.log("STEP X: set FAILED done");
      } catch (dbErr) {
        console.error("FAILED STATUS UPDATE ERROR:", dbErr);
      }

      try {
        await updateNotificationStatus(notificationId);
        console.log("STEP Y: notification status update after final failure done");
      } catch (statusErr) {
        console.error("NOTIFICATION STATUS UPDATE ERROR:", statusErr);
      }
    } else {
      console.log(
        `Retrying later... current failed attempt = ${job.attemptsMade + 1}, total allowed = ${job.opts.attempts}`
      );
    }

    throw err;
  }
}