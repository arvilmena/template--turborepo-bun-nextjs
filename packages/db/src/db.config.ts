import { z } from "zod";

const configSchema = z.object({
  DATABASE_URL: z.string().min(2),
});

const config = {
  DATABASE_URL: process.env.DATABASE_URL,
};

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  throw new Error(
    `DATABASE_CONFIG ENV vars not correct: @${__filename}: ${JSON.stringify(parsedConfig.error, null, 2)}`,
  );
}

export const DB_CONFIG = parsedConfig.data;
