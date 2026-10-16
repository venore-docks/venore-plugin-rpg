import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { contentEntries, contentVersions } from "../../database/schema";
import type { ContentEntry, ContentKind, ContentPack } from "../../contracts/types";

export async function selectEntries(kind?: ContentKind): Promise<ContentEntry[]> {
  const rows = await db
    .select()
    .from(contentEntries)
    .where(kind ? eq(contentEntries.kind, kind) : undefined)
    .orderBy(contentEntries.kind, contentEntries.key);
  return rows.map((r) => ({ kind: r.kind as ContentKind, key: r.key, data: r.data, updatedAt: r.updatedAt }));
}

export async function entryExists(kind: ContentKind, key: string): Promise<boolean> {
  const [row] = await db
    .select({ key: contentEntries.key })
    .from(contentEntries)
    .where(and(eq(contentEntries.kind, kind), eq(contentEntries.key, key)))
    .limit(1);
  return Boolean(row);
}

export async function upsertEntry(input: { kind: ContentKind; key: string; data: Record<string, unknown>; actorId: string }) {
  await db
    .insert(contentEntries)
    .values({ kind: input.kind, key: input.key, data: input.data, updatedByUserId: input.actorId })
    .onConflictDoUpdate({
      target: [contentEntries.kind, contentEntries.key],
      set: { data: input.data, updatedByUserId: input.actorId, updatedAt: sql`now()` },
    });
}

export async function deleteEntry(kind: ContentKind, key: string): Promise<boolean> {
  const rows = await db
    .delete(contentEntries)
    .where(and(eq(contentEntries.kind, kind), eq(contentEntries.key, key)))
    .returning({ key: contentEntries.key });
  return rows.length > 0;
}

/** Grava o pacote e carimba nele o número da versão gerada (numa transação). */
export async function insertVersion(input: { pack: ContentPack; notes: string | null; actorId: string }): Promise<number> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(contentVersions)
      .values({ pack: input.pack as unknown as Record<string, unknown>, notes: input.notes, publishedByUserId: input.actorId })
      .returning({ version: contentVersions.version });
    const pack = { ...input.pack, version: String(row.version) };
    await tx
      .update(contentVersions)
      .set({ pack: pack as unknown as Record<string, unknown> })
      .where(eq(contentVersions.version, row.version));
    return row.version;
  });
}

export async function selectLatestVersion(): Promise<{ version: number; pack: ContentPack } | null> {
  const [row] = await db.select().from(contentVersions).orderBy(desc(contentVersions.version)).limit(1);
  return row ? { version: row.version, pack: row.pack as unknown as ContentPack } : null;
}

export async function selectVersions(limit: number) {
  return db.select().from(contentVersions).orderBy(desc(contentVersions.version)).limit(limit);
}
