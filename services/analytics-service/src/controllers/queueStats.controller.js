import {
  getAllQueueStats,
  getQueueStatsByChannel,
} from "../services/queueStats.service.js";

export async function getAllQueueStatsController(req, res) {
  try {
    const data = await getAllQueueStats();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getQueueStatsByChannelController(req, res) {
  try {
    const { channel } = req.params;
    const data = await getQueueStatsByChannel(channel);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}