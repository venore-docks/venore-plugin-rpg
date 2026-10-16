import { timingSafeEqual } from "node:crypto";
import type { OperationResult } from "@venore/plugin-sdk";
import { beginOperation } from "@venore/plugin-sdk/observability";
import { hashToken, newSessionToken } from "../../shared/crypto";
import { opFail, opOk } from "../../shared/operation";
import { resolveSession } from "../accounts/service";
import { selectConfigRows, upsertConfigRows } from "../config/store";
import { selectCharacterOfAccount, touchCharacterLogin, updateCharacterSaves } from "./store";
import type { CharacterSaveInput, GameServerStatus, GameSession, ServerHeartbeat } from "../../contracts/types";

// Linhas da tabela rpg.config usadas aqui (fora do ServerConfig editável no formulário).
const KEY_HASH = "serverKeyHash";
const KEY_CREATED = "serverKeyCreatedAt";
const HEARTBEAT = "serverHeartbeat";
/** Sem batimento há mais que isso = servidor de jogo fora do ar. */
export const HEARTBEAT_TIMEOUT_MS = 90_000;

const SERVER_ACTOR = { id: "rpg-game-server", type: "user" as const };

/** Gera a chave do servidor de jogo. Só o hash fica gravado; a chave aparece uma única vez. */
export async function rotateServerKey(command: { actorId: string }): Promise<OperationResult<{ key: string; createdAt: string }>> {
  const handle = beginOperation({ useCase: "rpg.rotate-server-key", actor: { id: command.actorId, type: "user" }, kind: "write" });
  const key = `vrk_${newSessionToken()}`;
  const createdAt = new Date().toISOString();
  await upsertConfigRows({ [KEY_HASH]: hashToken(key), [KEY_CREATED]: createdAt });
  return opOk(handle, { key, createdAt });
}

export async function verifyServerKey(key: string | null): Promise<boolean> {
  if (!key) return false;
  const stored = (await selectConfigRows())[KEY_HASH];
  if (typeof stored !== "string" || stored === "") return false;
  const a = Buffer.from(hashToken(key));
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Jogador entrando no mundo: o token de login precisa ser válido e o personagem ser da conta. */
export async function openGameSession(command: { token: string; characterId: number }): Promise<OperationResult<GameSession>> {
  const handle = beginOperation({ useCase: "rpg.open-game-session", actor: SERVER_ACTOR, kind: "write" });
  const session = await resolveSession(command.token);
  if (!session.success) return opFail(handle, session.error);
  const row = await selectCharacterOfAccount(command.characterId, session.data.accountId);
  if (!row) return opFail(handle, { code: "rpg.not_found", message: "Personagem não encontrado nesta conta." });
  await touchCharacterLogin(row.id);
  return opOk(handle, {
    account: { id: session.data.accountId, name: row.accountName },
    character: { id: row.id, name: row.name, level: row.level, save: row.save ?? null },
  });
}

export async function saveCharacters(command: { characters: CharacterSaveInput[] }): Promise<OperationResult<{ saved: number[] }>> {
  const handle = beginOperation({ useCase: "rpg.save-characters", actor: SERVER_ACTOR, kind: "write" });
  const saved = await updateCharacterSaves(command.characters);
  return opOk(handle, { saved });
}

export async function recordHeartbeat(hb: ServerHeartbeat): Promise<OperationResult<void>> {
  await upsertConfigRows({ [HEARTBEAT]: { ...hb, at: new Date().toISOString() } });
  return { success: true, data: undefined };
}

export async function getGameServerStatus(now: Date = new Date()): Promise<OperationResult<GameServerStatus>> {
  const rows = await selectConfigRows();
  const hb = (rows[HEARTBEAT] ?? null) as (ServerHeartbeat & { at: string }) | null;
  const at = hb ? Date.parse(hb.at) : NaN;
  const online = Number.isFinite(at) && now.getTime() - at < HEARTBEAT_TIMEOUT_MS;
  return {
    success: true,
    data: {
      online,
      lastSeenAt: hb?.at ?? null,
      players: online && Array.isArray(hb?.players) ? hb.players.map(String) : [],
      serverVersion: hb?.serverVersion ?? null,
      contentVersion: hb?.contentVersion ?? null,
      keyCreatedAt: typeof rows[KEY_CREATED] === "string" ? (rows[KEY_CREATED] as string) : null,
      publicUrl: hb?.publicUrl ? hb.publicUrl : null,
    },
  };
}
