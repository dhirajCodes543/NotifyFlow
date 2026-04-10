import redis from "../config/redis.js";

const TEMPLATE_CACHE_TTL = 60 * 10; // 10 minutes

export function getTemplateCacheKey(name, channel) {
  return `template:${channel}:${name}`;
}

export async function getTemplateFromCache(name, channel) {
  try {
    const key = getTemplateCacheKey(name, channel);
    const cached = await redis.get(key);

    if (!cached) return null;

    return JSON.parse(cached);
  } catch (err) {
    console.error("template cache read failed:", err.message);
    return null;
  }
}

export async function setTemplateInCache(template) {
  try {
    const key = getTemplateCacheKey(template.name, template.channel);

    await redis.set(key, JSON.stringify(template), "EX", TEMPLATE_CACHE_TTL);
  } catch (err) {
    console.error("template cache write failed:", err.message);
  }
}

export async function deleteTemplateFromCache(name, channel) {
  try {
    const key = getTemplateCacheKey(name, channel);
    await redis.del(key);
  } catch (err) {
    console.error("template cache delete failed:", err.message);
  }
}