import { Router } from "express";
import {
  getOverviewController,
  getChannelStatsController,
  getChannelStatusStatsController,
  getRecentNotificationsController,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/overview", getOverviewController);
router.get("/channels", getChannelStatsController);
router.get("/channels/status", getChannelStatusStatsController);
router.get("/recent-notifications", getRecentNotificationsController);

export default router;