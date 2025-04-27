import { relative, resolve } from "node:path";
import { defineConfig } from "drizzle-kit";
import { DB_CONFIG } from "./src/db.config";

/**
 * This path acrobatics is due to:
 * https://github.com/drizzle-team/drizzle-orm/issues/3807#issuecomment-2660772658
 */
const basePath = relative(".", resolve(__dirname));
export default defineConfig({
  out: relative(".", resolve(basePath, "migrations")),
  schema: resolve(__dirname, "src/schema.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: DB_CONFIG.DATABASE_URL,
  },
});
