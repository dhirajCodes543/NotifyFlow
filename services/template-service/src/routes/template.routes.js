import { Router } from "express";
import {
  createTemplateController,
  getAllTemplatesController,
  getTemplateController,
  updateTemplateController,
  deleteTemplateController,
  renderTemplateController,
} from "../controllers/template.controller.js";

const router = Router();

router.post("/templates", createTemplateController);
router.get("/templates", getAllTemplatesController);
router.get("/templates/:name/:channel", getTemplateController);
router.put("/templates/:name/:channel", updateTemplateController);
router.delete("/templates/:name/:channel", deleteTemplateController);
router.post("/templates/render", renderTemplateController);

export default router;