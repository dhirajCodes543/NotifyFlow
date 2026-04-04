import prisma from "../config/prisma.js";

export async function getOverviewStats() {
  const totalNotifications = await prisma.notification.count();
  const totalEvents = await prisma.notificationEvent.count();

  const groupedStatuses = await prisma.notificationEvent.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const statusCounts = {
    PENDING: 0,
    PROCESSING: 0,
    SUCCESS: 0,
    FAILED: 0,
  };

  for (const row of groupedStatuses) {
    statusCounts[row.status] = row._count.status;
  }

  return {
    totalNotifications,
    totalEvents,
    statusCounts,
  };
}

export async function getChannelStats() {
  const groupedChannels = await prisma.notificationEvent.groupBy({
    by: ["channel"],
    _count: {
      channel: true,
    },
  });

  const channels = {
    EMAIL: 0,
    SMS: 0,
    PUSH: 0,
  };

  for (const row of groupedChannels) {
    channels[row.channel] = row._count.channel;
  }

  return { channels };
}

export async function getChannelStatusStats() {
  const grouped = await prisma.notificationEvent.groupBy({
    by: ["channel", "status"],
    _count: {
      status: true,
    },
  });

  const result = {
    EMAIL: { PENDING: 0, PROCESSING: 0, SUCCESS: 0, FAILED: 0 },
    SMS: { PENDING: 0, PROCESSING: 0, SUCCESS: 0, FAILED: 0 },
    PUSH: { PENDING: 0, PROCESSING: 0, SUCCESS: 0, FAILED: 0 },
  };

  for (const row of grouped) {
    result[row.channel][row.status] = row._count.status;
  }

  return result;
}

export async function getRecentNotifications(limit = 10) {
  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      userId: true,
      title: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { notifications };
}