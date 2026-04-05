import prisma from "../config/prisma.js";

export default async function updateNotificationStatus(notificationId) {
  const events = await prisma.notificationEvent.findMany({
    where: { notificationId },
  });

  if (!events.length) return;

  const statuses = events.map((e) => e.status);

  let notificationStatus = "PENDING";

  const allPending = statuses.every((s) => s === "PENDING");
  const allSuccess = statuses.every((s) => s === "SUCCESS");
  const allFailed = statuses.every((s) => s === "FAILED");
  const hasProcessing = statuses.some((s) => s === "PROCESSING");
  const hasSuccess = statuses.some((s) => s === "SUCCESS");
  const hasFailed = statuses.some((s) => s === "FAILED");

  if (allPending) {
    notificationStatus = "PENDING";
  } else if (allSuccess) {
    notificationStatus = "SUCCESS";
  } else if (allFailed) {
    notificationStatus = "FAILED";
  } else if (hasProcessing) {
    notificationStatus = "PROCESSING";
  } else if (hasSuccess && hasFailed) {
    notificationStatus = "PARTIAL_SUCCESS";
  } else {
    notificationStatus = "PROCESSING";
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { status: notificationStatus },
  });
}