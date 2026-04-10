import connection from "../config/redis.js";
import { Queue } from "bullmq";

export const failedPushQueue = new Queue("failed-push-queue", {
  connection: connection,
});