import { Worker } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("push-service connected to Redis");
});

redisConnection.on("error", (err) => {
  console.error("Redis error:", err.message);
});

const pushWorker = new Worker(
  "push-queue",
  async (job) => {
    console.log("Processing push job...");
    console.log("Job data:", job.data);

    // later real push sending logic goes here

    return { status: "sent" };
  },
  {
    connection: redisConnection,
  }
);

pushWorker.on("completed", (job) => {
  console.log(`push job completed: ${job.id}`);
});

pushWorker.on("failed", (job, err) => {
  console.log(`push job failed: ${job?.id}`);
  console.error(err.message);
});