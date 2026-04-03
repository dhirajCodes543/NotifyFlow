import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processEmailJob from "./processors/email.processor.js";

const worker = new Worker(
  "email-queue",
  processEmailJob,
  { connection }
);

console.log("email-service worker started");