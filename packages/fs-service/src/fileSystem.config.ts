import { z } from "zod";

const configSchema = z.interface({
  APP_ROOT_DIR_ABS_PATH: z.string().min(2),
});

const config = {
  APP_ROOT_DIR_ABS_PATH: process.env.APP_ROOT_DIR_ABS_PATH,
};

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  throw new Error(
    `FILE_SYSTEM_CONFIG ENV vars not correct: @${__filename}: ${JSON.stringify(parsedConfig.error, null, 2)}`,
  );
}

export const FILE_SYSTEM_CONFIG = parsedConfig.data;
