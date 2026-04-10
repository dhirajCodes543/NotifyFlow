import "dotenv/config";
import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processWhatsappJob from "./processors/whatsapp.processor.js";

const WHATSAPP_WORKER_CONCURRENCY = Number(
  process.env.WHATSAPP_WORKER_CONCURRENCY || 2
);
const WHATSAPP_RATE_LIMIT_MAX = Number(
  process.env.WHATSAPP_RATE_LIMIT_MAX || 2
);
const WHATSAPP_RATE_LIMIT_DURATION = Number(
  process.env.WHATSAPP_RATE_LIMIT_DURATION_MS || 1000
);

const worker = new Worker(
  "whatsapp-queue",
  processWhatsappJob,
  {
    connection,
    concurrency: WHATSAPP_WORKER_CONCURRENCY,
    limiter: {
      max: WHATSAPP_RATE_LIMIT_MAX,
      duration: WHATSAPP_RATE_LIMIT_DURATION,
    },
  }
);

console.log("whatsapp-service worker started");

console.log("Whatsapp worker config:", {
  concurrency: WHATSAPP_WORKER_CONCURRENCY,
  rateLimitMax: WHATSAPP_RATE_LIMIT_MAX,
  rateLimitDuration: WHATSAPP_RATE_LIMIT_DURATION,
});