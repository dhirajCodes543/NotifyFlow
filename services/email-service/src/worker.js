import "dotenv/config";
import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processEmailJob from "./processors/email.processor.js";

const EMAIL_WORKER_CONCURRENCY = Number(process.env.EMAIL_WORKER_CONCURRENCY || 5);
const EMAIL_RATE_LIMIT_MAX = Number(process.env.EMAIL_RATE_LIMIT_MAX || 10);
const EMAIL_RATE_LIMIT_DURATION = Number(process.env.EMAIL_RATE_LIMIT_DURATION_MS || 1000);

const worker = new Worker(
  "email-queue",
  processEmailJob,
  {
    connection,

    concurrency: EMAIL_WORKER_CONCURRENCY,

    limiter: {
      max: EMAIL_RATE_LIMIT_MAX,
      duration: EMAIL_RATE_LIMIT_DURATION,
    },
  }
);

console.log("email-service worker started");