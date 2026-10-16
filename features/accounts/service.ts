import type { OperationResult } from "@venore/plugin-sdk";
import { beginOperation } from "@venore/plugin-sdk/observability";
import { hashPassword, hashToken, newSessionToken, verifyPassword } from "../../shared/crypto";
import { opFail, opOk } from "../../shared/operation";
import { compareVersions } from "../../shared/version";
import { getServerConfig } from "../config/service";
import {
  countCharactersOf,
  deleteSessionsOf,
  insertAccount,
  insertCharacter,
  insertSession,
  selectAccountByNameKey,
  selectAccounts,
  selectCharactersOf,
  selectValidSession,
  touchAccountLogin,
  updateAccountBanned,
} from "./store";
import { formatCharacterName, nameKeyOf } from "./validation";
import type { AccountAdminView, CharacterSummary, LoginResponse } from "../../contracts/types";

const SESSION_DAYS = 30;
const MAX_CHARACTERS = 5;
// Chamadas do app não têm usuário do site; o ator é só rótulo de observabilidade.
const APP_ACTOR = { id: "rpg-app", type: "user" as const };

async function outdated(clientVersion: string): Promise<{ code: string; message: string } | null> {
  const config = await getServerConfig();
  if (!config.success) return config.error;
  if (compareVersions(clientVersion, config.data.minClientVersion) < 0) {
    return { code: "rpg.client_outdated", message: `Atualize o app: a versão mínima é ${config.data.minClientVersion}.` };
  }
  return null;
}

export async function registerAccount(command: { name: string; password: string; clientVersion: string }): Promise<OperationResult<{ id: number }>> {
  const handle = beginOperation({ useCase: "rpg.register-account", actor: APP_ACTOR, kind: "write" });
  const versionError = await outdated(command.clientVersion);
  if (versionError) return opFail(handle, versionError);
  const row = await insertAccount({
    name: command.name.trim(),
    nameKey: nameKeyOf(command.name),
    passwordHash: await hashPassword(command.password),
  });
  if (!row) return opFail(handle, { code: "rpg.name_taken", message: "Essa conta já existe." });
  return opOk(handle, { id: row.id });
}

export async function login(command: { name: string; password: string; clientVersion: string }): Promise<OperationResult<LoginResponse>> {
  const handle = beginOperation({ useCase: "rpg.login", actor: APP_ACTOR, kind: "write" });
  const versionError = await outdated(command.clientVersion);
  if (versionError) return opFail(handle, versionError);
  const account = await selectAccountByNameKey(nameKeyOf(command.name));
  const ok = account ? await verifyPassword(command.password, account.passwordHash) : false;
  if (!account || !ok) return opFail(handle, { code: "rpg.invalid_credentials", message: "Conta ou senha incorretas." });
  if (account.banned) return opFail(handle, { code: "rpg.banned", message: "Esta conta está bloqueada." });
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await insertSession({ tokenHash: hashToken(token), accountId: account.id, clientVersion: command.clientVersion, expiresAt });
  await touchAccountLogin(account.id);
  const chars = await selectCharactersOf([account.id]);
  return opOk(handle, {
    token,
    expiresAt,
    account: { id: account.id, name: account.name },
    characters: chars.map(({ id, name, level }) => ({ id, name, level })),
  });
}

/** Resolve o token Bearer do app numa conta ativa. */
export async function resolveSession(token: string): Promise<OperationResult<{ accountId: number }>> {
  const session = await selectValidSession(hashToken(token));
  if (!session || session.banned) {
    return { success: false, error: { code: "rpg.invalid_session", message: "Sessão expirada. Entre de novo." } };
  }
  return { success: true, data: { accountId: session.accountId } };
}

export async function createCharacter(command: { token: string; name: string }): Promise<OperationResult<CharacterSummary>> {
  const handle = beginOperation({ useCase: "rpg.create-character", actor: APP_ACTOR, kind: "write" });
  const session = await resolveSession(command.token);
  if (!session.success) return opFail(handle, session.error);
  if ((await countCharactersOf(session.data.accountId)) >= MAX_CHARACTERS) {
    return opFail(handle, { code: "rpg.too_many_characters", message: `Limite de ${MAX_CHARACTERS} personagens por conta.` });
  }
  const name = formatCharacterName(command.name);
  const row = await insertCharacter({ accountId: session.data.accountId, name, nameKey: nameKeyOf(name) });
  if (!row) return opFail(handle, { code: "rpg.name_taken", message: "Já existe um personagem com esse nome." });
  return opOk(handle, { id: row.id, name: row.name, level: row.level });
}

export async function listAccounts(limit = 200): Promise<OperationResult<AccountAdminView[]>> {
  const rows = await selectAccounts(limit);
  const chars = await selectCharactersOf(rows.map((r) => r.id));
  return {
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      banned: r.banned,
      createdAt: r.createdAt,
      lastLoginAt: r.lastLoginAt,
      characters: chars.filter((c) => c.accountId === r.id).map(({ id, name, level }) => ({ id, name, level })),
    })),
  };
}

export async function setAccountBanned(command: { accountId: number; banned: boolean; actorId: string }): Promise<OperationResult<void>> {
  const handle = beginOperation({ useCase: "rpg.set-account-banned", actor: { id: command.actorId, type: "user" }, kind: "write" });
  if (!(await updateAccountBanned(command.accountId, command.banned))) {
    return opFail(handle, { code: "rpg.not_found", message: "Conta não encontrada." });
  }
  if (command.banned) await deleteSessionsOf(command.accountId);
  return opOk(handle, undefined);
}
