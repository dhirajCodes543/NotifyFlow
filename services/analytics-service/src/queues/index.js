import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const emailQueue = new Queue("email-queue", { connection });
export const smsQueue = new Queue("sms-queue", { connection });
export const pushQueue = new Queue("push-queue", { connection });
export const whatsappQueue = new Queue("whatsapp-queue", { connection });

export const failedEmailQueue = new Queue("failed-email-queue", { connection });
export const failedSmsQueue = new Queue("failed-sms-queue", { connection });
export const failedPushQueue = new Queue("failed-push-queue", { connection });
export const failedWhatsappQueue = new Queue("failed-whatsapp-queue", { connection });

export const MAIN_QUEUE_MAP = {
  EMAIL: emailQueue,
  SMS: smsQueue,
  PUSH: pushQueue,
  WHATSAPP: whatsappQueue,
};

export const DLQ_QUEUE_MAP = {
  EMAIL: failedEmailQueue,
  SMS: failedSmsQueue,
  PUSH: failedPushQueue,
  WHATSAPP: failedWhatsappQueue,
};