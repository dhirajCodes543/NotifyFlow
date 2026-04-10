import connection from "../config/redis.js";
import { Queue } from "bullmq";

export const failedSmsQueue = new Queue("failed-sms-queue", {
  connection: connection,
});