import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});

export const smsQueue = new Queue("sms-queue", {
  connection: redisConnection,
});

export const pushQueue = new Queue("push-queue", {
  connection: redisConnection,
});