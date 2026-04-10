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
  const allSkipped = statuses.every((s) => s === "SKIPPED");

  const hasProcessing = statuses.some((s) => s === "PROCESSING");
  const hasSuccess = statuses.some((s) => s === "SUCCESS");
  const hasFailed = statuses.some((s) => s === "FAILED");
  const hasPending = statuses.some((s) => s === "PENDING");
  const hasSkipped = statuses.some((s) => s === "SKIPPED");

  if (allPending) {
    notificationStatus = "PENDING";
  } else if (allSuccess) {
    notificationStatus = "SUCCESS";
  } else if (allFailed || allSkipped) {
    notificationStatus = "FAILED";
  } else if (hasProcessing || hasPending) {
    notificationStatus = "PROCESSING";
  } else if (hasSuccess && (hasFailed || hasSkipped)) {
    notificationStatus = "PARTIAL_SUCCESS";
  } else if (hasFailed && hasSkipped && !hasSuccess) {
    notificationStatus = "FAILED";
  } else {
    notificationStatus = "PROCESSING";
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { status: notificationStatus },
  });
}