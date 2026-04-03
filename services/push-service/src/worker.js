import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processPushJob from "./processors/push.processor.js";

const worker = new Worker(
  "push-queue",
  processPushJob,
  { connection }
);

console.log("push-service worker started");