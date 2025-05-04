import type { RedisJSON } from "@redis/json/dist/lib/commands";
import { type RedisClientType, redisClient } from "./redis.client";

export class RedisService {
  private readonly client: RedisClientType;

  constructor() {
    this.client = redisClient;
  }

  async getJson(key: string) {
    const json = await this.client.json.get(key);
    return JSON.parse(json as string);
  }

  async setJson(key: string, value: RedisJSON) {
    return await this.client.json.set(key, "$", value);
  }

  async del(key: string) {
    return await this.client.del(key);
  }
}

export const redisService = new RedisService();
