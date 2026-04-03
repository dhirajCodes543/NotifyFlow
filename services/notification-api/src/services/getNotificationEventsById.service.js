import prisma from "../config/prisma.js";

export default async function getNotificationEventsById(notificationId) {
  if (!notificationId) {
    throw new Error("notification id is required");
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("notification not found");
  }

  const events = await prisma.notificationEvent.findMany({
    where: { notificationId },
    orderBy: { createdAt: "asc" },
  });

  return events;
}