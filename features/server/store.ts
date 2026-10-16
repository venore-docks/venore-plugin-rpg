import { and, eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { accounts, characters } from "../../database/schema";

export async function selectCharacterOfAccount(characterId: number, accountId: number) {
  const [row] = await db
    .select({ id: characters.id, name: characters.name, level: characters.level, save: characters.save, accountName: accounts.name })
    .from(characters)
    .innerJoin(accounts, eq(accounts.id, characters.accountId))
    .where(and(eq(characters.id, characterId), eq(characters.accountId, accountId)))
    .limit(1);
  return row ?? null;
}

export async function touchCharacterLogin(characterId: number) {
  await db.update(characters).set({ lastLoginAt: sql`now()` }).where(eq(characters.id, characterId));
}

/** Grava o estado de vários personagens; devolve os ids que existiam. */
export async function updateCharacterSaves(rows: { id: number; level: number; save: Record<string, unknown> }[]): Promise<number[]> {
  if (rows.length === 0) return [];
  return db.transaction(async (tx) => {
    const saved: number[] = [];
    for (const r of rows) {
      const updated = await tx
        .update(characters)
        .set({ level: r.level, save: r.save, updatedAt: sql`now()` })
        .where(eq(characters.id, r.id))
        .returning({ id: characters.id });
      if (updated.length > 0) saved.push(r.id);
    }
    return saved;
  });
}
