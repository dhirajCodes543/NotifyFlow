import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
  limiter: {
    max: 4,         // Resend allows 5 req/sec per team, keep a buffer
    duration: 1000,
  },
});

export const smsQueue = new Queue("sms-queue", {
  connection: redisConnection,
  limiter: {
    max: 1,         // conservative for Twilio trial
    duration: 1000,
  },
});

export const pushQueue = new Queue("push-queue", {
  connection: redisConnection,
  limiter: {
    max: 20,        // no provider constraint shown here yet
    duration: 1000,
  },
});

export const whatsappQueue = new Queue("whatsapp-queue", {
  connection: redisConnection,
  limiter: {
    max: 1,         // conservative for Twilio trial / sandbox use
    duration: 1000,
  },
});