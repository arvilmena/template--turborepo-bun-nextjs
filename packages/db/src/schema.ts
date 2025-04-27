import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";

const timeStampOpts = {
  withTimezone: true,
  mode: "string",
} as const;

const createdAt = timestamp("created_at", timeStampOpts)
  .default(sql`(now() AT TIME ZONE 'utc'::text)`)
  .notNull();

const updatedAt = timestamp("updated_at", timeStampOpts)
  .default(sql`(now() AT TIME ZONE 'utc'::text)`)
  .notNull()
  .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`);

export const users = pgTable("users", {
  id: integer(),
  createdAt,
  updatedAt,
});
