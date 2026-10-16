import type { OperationResult } from "@venore/plugin-sdk";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { RULE_LIMITS } from "../../shared/config";
import { isValidVersion } from "../../shared/version";
import { getServerConfig, updateServerConfig } from "./service";
import type { GameRules, ServerConfig } from "../../contracts/types";

export async function getServerConfigHandler(): Promise<OperationResult<ServerConfig>> {
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return getServerConfig();
}

export function validateServerConfig(input: ServerConfig): { code: string; message: string } | null {
  if (input.serverName.trim() === "") return { code: "rpg.invalid_config", message: "Nome do servidor é obrigatório." };
  for (const [label, v] of [["Versão mínima", input.minClientVersion], ["Versão mais recente", input.latestClientVersion]] as const) {
    if (!isValidVersion(v)) return { code: "rpg.invalid_version", message: `${label}: use o formato 1.2.3.` };
  }
  for (const url of [input.downloadUrl, input.gameServerUrl]) {
    if (url !== "" && !/^(https?|wss?):\/\/\S+$/.test(url)) {
      return { code: "rpg.invalid_url", message: `Endereço inválido: ${url}` };
    }
  }
  for (const key of Object.keys(RULE_LIMITS) as (keyof GameRules)[]) {
    const { label, min, max } = RULE_LIMITS[key];
    const v = input.rules[key];
    if (!Number.isFinite(v) || v < min || v > max) return { code: "rpg.invalid_rule", message: `${label}: entre ${min} e ${max}.` };
  }
  return null;
}

export async function updateServerConfigHandler(input: ServerConfig): Promise<OperationResult<ServerConfig>> {
  const error = validateServerConfig(input);
  if (error) return { success: false, error };
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return updateServerConfig({ config: input, actorId: authz.actorId });
}
