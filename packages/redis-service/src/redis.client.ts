import logger from "@my/base/logger";
import { createClient } from "redis";
import { REDIS_CONFIG } from "./redis.config";

const client = createClient({
  url: REDIS_CONFIG.REDIS_DATA_URL,
  socket: {
    connectTimeout: 10000,
    keepAlive: true,
  },
});

await client.connect();

client.on("connect", () => {
  logger.info("Connected to Redis");
});

client.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

export const redisClient = client;
export type RedisClientType = typeof client;
