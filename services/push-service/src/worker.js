import "dotenv/config";
import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processPushJob from "./processors/push.processor.js";

const PUSH_WORKER_CONCURRENCY = Number(process.env.PUSH_WORKER_CONCURRENCY || 10);
const PUSH_RATE_LIMIT_MAX = Number(process.env.PUSH_RATE_LIMIT_MAX || 20);
const PUSH_RATE_LIMIT_DURATION = Number(process.env.PUSH_RATE_LIMIT_DURATION_MS || 1000);

const worker = new Worker(
  "push-queue",
  processPushJob,
  {
    connection,

    concurrency: PUSH_WORKER_CONCURRENCY,

    limiter: {
      max: PUSH_RATE_LIMIT_MAX,
      duration: PUSH_RATE_LIMIT_DURATION,
    },
  }
);

console.log("push-service worker started");

console.log("Push worker config:", {
  concurrency: PUSH_WORKER_CONCURRENCY,
  rateLimitMax: PUSH_RATE_LIMIT_MAX,
  rateLimitDuration: PUSH_RATE_LIMIT_DURATION,
});