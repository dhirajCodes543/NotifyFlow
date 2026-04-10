import prisma from "../config/prisma.js";

export default async function idempotency(req, res, next) {
  const key = req.headers["idempotency-key"];

  if (!key) {
    return next();
  }

  try {
    await prisma.idempotencyKey.create({
      data: {
        key,
        status: "PROCESSING",
      },
    });

    // this request successfully claimed the key
    req.idempotencyKey = key;
    req.idempotencyOwner = true;
    return next();
  } catch (err) {
    // if duplicate key, another request already claimed it
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!existing) {
      return res.status(500).json({
        error: "Idempotency state could not be determined",
      });
    }

    if (existing.status === "COMPLETED") {
      return res.status(200).json(existing.response);
    }

    return res.status(409).json({
      message: "Request with this idempotency key is already processing",
    });
  }
}