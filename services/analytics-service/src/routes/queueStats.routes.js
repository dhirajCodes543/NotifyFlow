import { Router } from "express";
import {
  getAllQueueStatsController,
  getQueueStatsByChannelController,
} from "../controllers/queueStats.controller.js";

const router = Router();

console.log("queue stats routes loaded");

router.get("/stats", getAllQueueStatsController);
router.get("/stats/:channel", getQueueStatsByChannelController);

export default router;