import { and, asc, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { accounts, characters, sessions } from "../../database/schema";

export async function selectAccountByNameKey(nameKey: string) {
  const [row] = await db.select().from(accounts).where(eq(accounts.nameKey, nameKey)).limit(1);
  return row ?? null;
}

export async function selectAccountById(accountId: number) {
  const [row] = await db.select({ id: accounts.id, name: accounts.name }).from(accounts).where(eq(accounts.id, accountId)).limit(1);
  return row ?? null;
}

export async function insertAccount(input: { name: string; nameKey: string; passwordHash: string }) {
  const [row] = await db.insert(accounts).values(input).onConflictDoNothing().returning();
  return row ?? null;
}

export async function touchAccountLogin(accountId: number) {
  await db.update(accounts).set({ lastLoginAt: sql`now()` }).where(eq(accounts.id, accountId));
}

export async function insertSession(input: { tokenHash: string; accountId: number; clientVersion: string; expiresAt: Date }) {
  await db.insert(sessions).values(input);
  // limpeza oportunista das sessões vencidas
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export async function selectValidSession(tokenHash: string) {
  const [row] = await db
    .select({ accountId: sessions.accountId, banned: accounts.banned })
    .from(sessions)
    .innerJoin(accounts, eq(accounts.id, sessions.accountId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function deleteSessionsOf(accountId: number) {
  await db.delete(sessions).where(eq(sessions.accountId, accountId));
}

export async function selectCharactersOf(accountIds: number[]) {
  if (accountIds.length === 0) return [];
  return db
    .select({ id: characters.id, accountId: characters.accountId, name: characters.name, level: characters.level })
    .from(characters)
    .where(inArray(characters.accountId, accountIds))
    .orderBy(asc(characters.id));
}

export async function countCharactersOf(accountId: number): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(characters).where(eq(characters.accountId, accountId));
  return row?.n ?? 0;
}

export async function insertCharacter(input: { accountId: number; name: string; nameKey: string }) {
  const [row] = await db.insert(characters).values(input).onConflictDoNothing().returning();
  return row ?? null;
}

export async function selectAccounts(limit: number) {
  return db.select().from(accounts).orderBy(desc(accounts.createdAt)).limit(limit);
}

export async function updateAccountBanned(accountId: number, banned: boolean): Promise<boolean> {
  const rows = await db.update(accounts).set({ banned }).where(eq(accounts.id, accountId)).returning({ id: accounts.id });
  return rows.length > 0;
}
