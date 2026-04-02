import { Worker } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("sms-service connected to Redis");
});

redisConnection.on("error", (err) => {
  console.error("Redis error:", err.message);
});

const emailWorker = new Worker(
  "sms-queue",
  async (job) => {
    console.log("Processing sms job...");
    console.log("Job data:", job.data);

    // later real email sending logic goes here

    return { status: "sent" };
  },
  {
    connection: redisConnection,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`sms job completed: ${job.id}`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`sms job failed: ${job?.id}`);
  console.error(err.message);
});