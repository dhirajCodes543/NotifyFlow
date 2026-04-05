import prisma from "../config/prisma.js";

export default async function idempotency(req, res, next) {
  const key = req.headers["idempotency-key"];

  if (!key) {
    return next();
  }

  const existing = await prisma.idempotencyKey.findUnique({
    where: { key }
  });

  if (existing) {
    return res.status(200).json(existing.response);
  }

  req.idempotencyKey = key;

  next();
}