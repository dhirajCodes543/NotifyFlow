import connection from "../config/redis.js";
import { Queue } from "bullmq";

export const failedEmailQueue = new Queue("failed-email-queue", {
  connection: connection,
});