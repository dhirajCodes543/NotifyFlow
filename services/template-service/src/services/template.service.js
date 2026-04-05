import prisma from "../config/prisma.js";

const ALLOWED_CHANNELS = ["EMAIL", "SMS", "PUSH", "WHATSAPP"];

function normalizeChannel(channel) {
  const upper = channel?.toUpperCase();
  if (!ALLOWED_CHANNELS.includes(upper)) {
    throw new Error("invalid channel");
  }
  return upper;
}

function applyVariables(template, variables = {}) {
  if (!template) return template;

  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
  });
}

export async function createTemplate(data) {
  const { name, channel, titleTemplate, bodyTemplate } = data;

  if (!name || !channel || !bodyTemplate) {
    throw new Error("name, channel and bodyTemplate are required");
  }

  const normalizedChannel = normalizeChannel(channel);

  const template = await prisma.template.create({
    data: {
      name,
      channel: normalizedChannel,
      titleTemplate: titleTemplate || null,
      bodyTemplate,
    },
  });

  return template;
}

export async function getAllTemplates() {
  const templates = await prisma.template.findMany({
    orderBy: [{ name: "asc" }, { channel: "asc" }],
  });

  return { templates };
}

export async function getTemplateByNameAndChannel(name, channel) {
  const normalizedChannel = normalizeChannel(channel);

  const template = await prisma.template.findFirst({
    where: {
      name,
      channel: normalizedChannel,
    },
  });

  if (!template) {
    throw new Error("template not found");
  }

  return template;
}

export async function updateTemplate(name, channel, data) {
  const normalizedChannel = normalizeChannel(channel);

  const existing = await prisma.template.findFirst({
    where: {
      name,
      channel: normalizedChannel,
    },
  });

  if (!existing) {
    throw new Error("template not found");
  }

  const updated = await prisma.template.update({
    where: { id: existing.id },
    data: {
      titleTemplate:
        data.titleTemplate !== undefined ? data.titleTemplate : existing.titleTemplate,
      bodyTemplate:
        data.bodyTemplate !== undefined ? data.bodyTemplate : existing.bodyTemplate,
    },
  });

  return updated;
}

export async function deleteTemplate(name, channel) {
  const normalizedChannel = normalizeChannel(channel);

  const existing = await prisma.template.findFirst({
    where: {
      name,
      channel: normalizedChannel,
    },
  });

  if (!existing) {
    throw new Error("template not found");
  }

  await prisma.template.delete({
    where: { id: existing.id },
  });

  return { message: "template deleted" };
}

export async function renderTemplate(data) {
  const { name, channel, variables } = data;

  if (!name || !channel) {
    throw new Error("name and channel are required");
  }

  const normalizedChannel = normalizeChannel(channel);

  const template = await prisma.template.findFirst({
    where: {
      name,
      channel: normalizedChannel,
    },
  });

  if (!template) {
    throw new Error("template not found");
  }

  const renderedTitle = applyVariables(template.titleTemplate, variables);
  const renderedBody = applyVariables(template.bodyTemplate, variables);

  return {
    name: template.name,
    channel: template.channel,
    title: renderedTitle,
    message: renderedBody,
  };
}