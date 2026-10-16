import type { OperationResult } from "@venore/plugin-sdk";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getGameServerStatus, openGameSession, recordHeartbeat, rotateServerKey, saveCharacters, verifyServerKey } from "./service";
import { validateHeartbeat, validateSaves } from "./validation";
import type { CharacterSaveInput, GameServerStatus, GameSession, ServerHeartbeat } from "../../contracts/types";

const BAD_KEY = { code: "rpg.invalid_server_key", message: "Chave do servidor de jogo inválida." } as const;

export async function rotateServerKeyHandler(): Promise<OperationResult<{ key: string; createdAt: string }>> {
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return rotateServerKey({ actorId: authz.actorId });
}

export async function getGameServerStatusHandler(): Promise<OperationResult<GameServerStatus>> {
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return getGameServerStatus();
}

// --- chamadas do servidor de jogo (header X-Server-Key) -----------------------------------

export async function openGameSessionHandler(input: { serverKey: string | null; token: string; characterId: number }): Promise<OperationResult<GameSession>> {
  if (!(await verifyServerKey(input.serverKey))) return { success: false, error: BAD_KEY };
  if (input.token === "" || !Number.isInteger(input.characterId)) {
    return { success: false, error: { code: "rpg.invalid_session", message: "Sessão inválida." } };
  }
  return openGameSession({ token: input.token, characterId: input.characterId });
}

export async function saveCharactersHandler(input: { serverKey: string | null; characters: unknown }): Promise<OperationResult<{ saved: number[] }>> {
  if (!(await verifyServerKey(input.serverKey))) return { success: false, error: BAD_KEY };
  const parsed = validateSaves(input.characters);
  if (!parsed.ok) return { success: false, error: parsed.error };
  return saveCharacters({ characters: parsed.value as CharacterSaveInput[] });
}

export async function recordHeartbeatHandler(input: { serverKey: string | null; heartbeat: unknown }): Promise<OperationResult<void>> {
  if (!(await verifyServerKey(input.serverKey))) return { success: false, error: BAD_KEY };
  const parsed = validateHeartbeat(input.heartbeat);
  if (!parsed.ok) return { success: false, error: parsed.error };
  return recordHeartbeat(parsed.value as ServerHeartbeat);
}
