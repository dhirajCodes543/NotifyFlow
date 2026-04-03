import prisma from "../config/prisma.js";

export default async function getNotificationById(notificationId) {
  if (!notificationId) {
    throw new Error("notification id is required");
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("notification not found");
  }

  return notification;
}