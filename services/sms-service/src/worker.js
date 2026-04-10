import "dotenv/config";
import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processSmsJob from "./processors/sms.processor.js";

const SMS_WORKER_CONCURRENCY = Number(process.env.SMS_WORKER_CONCURRENCY || 3);
const SMS_RATE_LIMIT_MAX = Number(process.env.SMS_RATE_LIMIT_MAX || 5);
const SMS_RATE_LIMIT_DURATION = Number(process.env.SMS_RATE_LIMIT_DURATION_MS || 1000);

const worker = new Worker(
  "sms-queue",
  processSmsJob,
  {
    connection,

    concurrency: SMS_WORKER_CONCURRENCY,

    limiter: {
      max: SMS_RATE_LIMIT_MAX,
      duration: SMS_RATE_LIMIT_DURATION,
    },
  }
);

console.log("sms-service worker started");

console.log("SMS worker config:", {
  concurrency: SMS_WORKER_CONCURRENCY,
  rateLimitMax: SMS_RATE_LIMIT_MAX,
  rateLimitDuration: SMS_RATE_LIMIT_DURATION,
});