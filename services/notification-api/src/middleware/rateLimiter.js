import redis from "../config/redis.js";

const RATE_LIMIT_LUA = `
local key = KEYS[1]

local now = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local window = tonumber(ARGV[4])

redis.call("ZREMRANGEBYSCORE", key, 0, window_start)

local current = redis.call("ZCARD", key)

if current >= limit then
  return 0
end

redis.call("ZADD", key, now, now)
redis.call("EXPIRE", key, window)

return 1
`;

redis.defineCommand("rateLimit", {
  numberOfKeys: 1,
  lua: RATE_LIMIT_LUA,
});

export default async function rateLimiter(req, res, next) {
  try {
    const now = Date.now();
    const windowStart = now - 60000;

    const globalKey = "rate:global";
    const ipKey = `rate:ip:${req.ip}`;

    const globalAllowed = await redis.rateLimit(
      globalKey,
      now,
      windowStart,
      200,
      60
    );

    if (globalAllowed === 0) {
      return res.status(429).json({
        error: "Server is busy. Try again later.",
      });
    }

    const ipAllowed = await redis.rateLimit(
      ipKey,
      now,
      windowStart,
      20,
      60
    );

    if (ipAllowed === 0) {
      return res.status(429).json({
        error: "Too many requests from this IP. Try again later.",
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next();
  }
}