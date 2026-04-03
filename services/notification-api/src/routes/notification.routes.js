import { Router } from "express";
import { getNotificationByIdController } from "../controllers/getNotificationById.controller.js";
import { sendNotification } from "../controllers/notification.controller.js";
import { getNotificationEventsByIdController } from "../controllers/getNotificationEventsById.controller.js";

const router = Router();

router.post("/notifications", sendNotification);
router.get("/notifications/:id", getNotificationByIdController);
router.get("/notifications/:id/events", getNotificationEventsByIdController);

export default router;