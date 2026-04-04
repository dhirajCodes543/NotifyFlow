import {
  getOverviewStats,
  getChannelStats,
  getChannelStatusStats,
  getRecentNotifications,
} from "../services/analytics.service.js";

export async function getOverviewController(req, res) {
  try {
    const data = await getOverviewStats();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getChannelStatsController(req, res) {
  try {
    const data = await getChannelStats();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getChannelStatusStatsController(req, res) {
  try {
    const data = await getChannelStatusStats();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getRecentNotificationsController(req, res) {
  try {
    const limit = Number(req.query.limit) || 10;
    const data = await getRecentNotifications(limit);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}