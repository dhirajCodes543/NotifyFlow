import { Router } from "express";
import { createNotification } from "../controllers/notification.controller.js";

const router = Router();

router.post("/notifications", createNotification);

export default router;