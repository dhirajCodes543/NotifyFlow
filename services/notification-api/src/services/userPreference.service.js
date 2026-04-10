import prisma from "../config/prisma.js";

export async function findUserPreference(userId) {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
}

export async function getOrCreateUserPreference(userId) {
  let preference = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (!preference) {
    preference = await prisma.userPreference.create({
      data: { userId },
    });
  }

  return preference;
}

export function isChannelEnabled(preference, dbChannel) {
  switch (dbChannel) {
    case "EMAIL":
      return preference.emailEnabled;
    case "SMS":
      return preference.smsEnabled;
    case "PUSH":
      return preference.pushEnabled;
    case "WHATSAPP":
      return preference.whatsappEnabled;
    default:
      return false;
  }
}