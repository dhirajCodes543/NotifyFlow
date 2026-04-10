import prisma from "../config/prisma.js";
import {
  findUserPreference,
  getOrCreateUserPreference,
} from "../services/userPreference.service.js";

export async function getUserPreference(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const preference = await findUserPreference(userId);

    if (!preference) {
      return res.status(404).json({
        error: "user preference not found",
      });
    }

    return res.status(200).json(preference);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function updateUserPreference(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const {
      emailEnabled,
      smsEnabled,
      pushEnabled,
      whatsappEnabled,
    } = req.body;

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(smsEnabled !== undefined && { smsEnabled }),
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(whatsappEnabled !== undefined && { whatsappEnabled }),
      },
      create: {
        userId,
        emailEnabled: emailEnabled ?? true,
        smsEnabled: smsEnabled ?? true,
        pushEnabled: pushEnabled ?? true,
        whatsappEnabled: whatsappEnabled ?? true,
      },
    });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}