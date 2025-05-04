import { z } from "zod";

const configSchema = z.interface({
  REDIS_DATA_URL: z.string().min(1),
  REDIS_KEY_PREFIX: z.coerce.number(),
  REDIS_EXPIRATION_IN_SECONDS: z.coerce.number().min(1),
});

const config = {
  REDIS_DATA_URL: process.env.REDIS_DATA_URL,
  REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX,
  REDIS_EXPIRATION_IN_SECONDS: process.env.REDIS_EXPIRATION_IN_SECONDS,
};

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  throw new Error(
    `Redis Config ENV vars not correct: @${__filename}: ${JSON.stringify(parsedConfig.error.issues, null, 2)}`,
  );
}

export const REDIS_CONFIG = parsedConfig.data;
