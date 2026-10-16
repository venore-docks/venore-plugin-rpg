import type { OperationResult } from "@venore/plugin-sdk";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { isValidVersion } from "../../shared/version";
import { createCharacter, listAccounts, login, registerAccount, setAccountBanned } from "./service";
import { validateAccountName, validateCharacterName, validatePassword } from "./validation";
import type { AccountAdminView, CharacterSummary, LoginResponse } from "../../contracts/types";

type Credentials = { account: string; password: string; clientVersion: string };

function validateCredentials(input: Credentials) {
  if (!isValidVersion(input.clientVersion)) {
    return { code: "rpg.client_outdated", message: "Versão do app desconhecida. Atualize o app." };
  }
  return validateAccountName(input.account) ?? validatePassword(input.password);
}

/** Público (app). */
export async function registerAccountHandler(input: Credentials): Promise<OperationResult<{ id: number }>> {
  const error = validateCredentials(input);
  if (error) return { success: false, error };
  return registerAccount({ name: input.account, password: input.password, clientVersion: input.clientVersion });
}

/** Público (app). */
export async function loginHandler(input: Credentials): Promise<OperationResult<LoginResponse>> {
  const error = validateCredentials(input);
  if (error) return { success: false, error: { code: "rpg.invalid_credentials", message: "Conta ou senha incorretas." } };
  return login({ name: input.account, password: input.password, clientVersion: input.clientVersion });
}

/** App autenticado pelo token de sessão. */
export async function createCharacterHandler(input: { token: string | null; name: string }): Promise<OperationResult<CharacterSummary>> {
  if (!input.token) return { success: false, error: { code: "rpg.invalid_session", message: "Entre na sua conta primeiro." } };
  const error = validateCharacterName(input.name);
  if (error) return { success: false, error };
  return createCharacter({ token: input.token, name: input.name });
}

export async function listAccountsHandler(): Promise<OperationResult<AccountAdminView[]>> {
  const authz = await authorizeActor("rpg.accounts");
  if (!authz.authorized) return { success: false, error: authz.error };
  return listAccounts();
}

export async function setAccountBannedHandler(input: { accountId: number; banned: boolean }): Promise<OperationResult<void>> {
  if (!Number.isInteger(input.accountId)) return { success: false, error: { code: "rpg.not_found", message: "Conta inválida." } };
  const authz = await authorizeActor("rpg.accounts");
  if (!authz.authorized) return { success: false, error: authz.error };
  return setAccountBanned({ accountId: input.accountId, banned: input.banned, actorId: authz.actorId });
}
