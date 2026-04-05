import {
  createTemplate,
  getAllTemplates,
  getTemplateByNameAndChannel,
  updateTemplate,
  deleteTemplate,
  renderTemplate,
} from "../services/template.service.js";

export async function createTemplateController(req, res) {
  try {
    const data = await createTemplate(req.body);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function getAllTemplatesController(req, res) {
  try {
    const data = await getAllTemplates();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getTemplateController(req, res) {
  try {
    const { name, channel } = req.params;
    const data = await getTemplateByNameAndChannel(name, channel);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}

export async function updateTemplateController(req, res) {
  try {
    const { name, channel } = req.params;
    const data = await updateTemplate(name, channel, req.body);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function deleteTemplateController(req, res) {
  try {
    const { name, channel } = req.params;
    const data = await deleteTemplate(name, channel);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}

export async function renderTemplateController(req, res) {
  try {
    const data = await renderTemplate(req.body);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}