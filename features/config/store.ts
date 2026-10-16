import { sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { config } from "../../database/schema";

export async function selectConfigRows(): Promise<Record<string, unknown>> {
  const rows = await db.select().from(config);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function upsertConfigRows(values: Record<string, unknown>): Promise<void> {
  const entries = Object.entries(values);
  if (entries.length === 0) return;
  await db
    .insert(config)
    .values(entries.map(([key, value]) => ({ key, value })))
    .onConflictDoUpdate({ target: config.key, set: { value: sql`excluded.value`, updatedAt: sql`now()` } });
}
