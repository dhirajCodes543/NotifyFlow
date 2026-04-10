import { MAIN_QUEUE_MAP, DLQ_QUEUE_MAP } from "../queues/index.js";

const ALLOWED_CHANNELS = ["EMAIL", "SMS", "PUSH", "WHATSAPP"];

function normalizeChannel(channel) {
  const upper = channel?.toUpperCase();

  if (!ALLOWED_CHANNELS.includes(upper)) {
    throw new Error("invalid channel");
  }

  return upper;
}

async function getQueueCounts(queue) {
  const counts = await queue.getJobCounts(
    "wait",
    "active",
    "completed",
    "failed",
    "delayed"
  );

  return {
    waiting: counts.wait || 0,
    active: counts.active || 0,
    completed: counts.completed || 0,
    failed: counts.failed || 0,
    delayed: counts.delayed || 0,
  };
}

export async function getAllQueueStats() {
  const results = await Promise.all(
    ALLOWED_CHANNELS.map(async (channel) => {
      const mainQueue = MAIN_QUEUE_MAP[channel];
      const dlqQueue = DLQ_QUEUE_MAP[channel];

      const [mainQueueStats, dlqQueueStats] = await Promise.all([
        getQueueCounts(mainQueue),
        getQueueCounts(dlqQueue),
      ]);

      return {
        channel,
        mainQueue: mainQueueStats,
        dlqQueue: dlqQueueStats,
      };
    })
  );

  return { queues: results };
}

export async function getQueueStatsByChannel(channel) {
  const normalizedChannel = normalizeChannel(channel);

  const mainQueue = MAIN_QUEUE_MAP[normalizedChannel];
  const dlqQueue = DLQ_QUEUE_MAP[normalizedChannel];

  const [mainQueueStats, dlqQueueStats] = await Promise.all([
    getQueueCounts(mainQueue),
    getQueueCounts(dlqQueue),
  ]);

  return {
    channel: normalizedChannel,
    mainQueue: mainQueueStats,
    dlqQueue: dlqQueueStats,
  };
}