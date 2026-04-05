import { Worker } from "bullmq";
import connection from "./config/redis.js";
import processWhatsappJob from "./processors/whatsapp.processor.js";

const worker = new Worker(
  "whatsapp-queue",
  processWhatsappJob,
  { connection }
);

console.log("whatsapp-service worker started");