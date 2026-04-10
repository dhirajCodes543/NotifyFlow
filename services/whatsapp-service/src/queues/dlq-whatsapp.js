import connection from "../config/redis.js";
import { Queue } from "bullmq";

export const failedWhatsappQueue = new Queue("failed-whatsapp-queue", {
  connection: connection,
});