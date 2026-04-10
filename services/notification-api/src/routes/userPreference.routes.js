import express from "express";
import {
  getUserPreference,
  updateUserPreference,
} from "../controllers/userPreference.controller.js";

const router = express.Router();

router.get("/:userId", getUserPreference);
router.put("/:userId", updateUserPreference);

export default router;