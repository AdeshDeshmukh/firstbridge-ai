// Creates one Redis connection
import { createClient } from "redis";
import { env } from "./env";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});