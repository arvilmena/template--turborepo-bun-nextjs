import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { DB_CONFIG } from "./db.config";
import * as schema from "./schema";

const client = new SQL(DB_CONFIG.DATABASE_URL);
export const db = drizzle({ client, schema });
export type DbType = typeof db;
