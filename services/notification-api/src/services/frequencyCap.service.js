import redisConnection from "../config/redis.js";
import { FREQUENCY_CAPS } from "../config/frequencyCaps.js";

export async function checkAndReserveFrequencyCap({ userId, channel, eventId }) {
  const rule = FREQUENCY_CAPS[channel];

  if (!rule) {
    return { allowed: true };
  }

  const key = `cap:user:${userId}:channel:${channel}`;
  const now = Date.now();
  const windowStart = now - rule.windowSeconds * 1000;

  await redisConnection.zremrangebyscore(key, 0, windowStart);

  const currentCount = await redisConnection.zcard(key);

  if (currentCount >= rule.maxCount) {
    return {
      allowed: false,
      reason: "FREQUENCY_CAP_REACHED",
    };
  }

  await redisConnection.zadd(key, now, eventId);
  await redisConnection.expire(key, rule.windowSeconds);

  return { allowed: true };
}