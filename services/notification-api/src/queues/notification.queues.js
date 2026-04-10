import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

/* ================================
   Main Notification Queues
================================ */

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
  limiter: {
    max: 4,
    duration: 1000,
  },
});

export const smsQueue = new Queue("sms-queue", {
  connection: redisConnection,
  limiter: {
    max: 1,
    duration: 1000,
  },
});

export const pushQueue = new Queue("push-queue", {
  connection: redisConnection,
  limiter: {
    max: 20,
    duration: 1000,
  },
});

export const whatsappQueue = new Queue("whatsapp-queue", {
  connection: redisConnection,
  limiter: {
    max: 1,
    duration: 1000,
  },
});

/* ================================
   Dead Letter Queues (DLQ)
================================ */

export const failedEmailQueue = new Queue("failed-email-queue", {
  connection: redisConnection,
});

export const failedSmsQueue = new Queue("failed-sms-queue", {
  connection: redisConnection,
});

export const failedPushQueue = new Queue("failed-push-queue", {
  connection: redisConnection,
});

export const failedWhatsappQueue = new Queue("failed-whatsapp-queue", {
  connection: redisConnection,
});