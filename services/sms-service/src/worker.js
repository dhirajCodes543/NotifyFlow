import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processSmsJob from "./processors/sms.processor.js";

const worker = new Worker(
  "sms-queue",
  processSmsJob,
  { connection }
);

console.log("sms-service worker started");