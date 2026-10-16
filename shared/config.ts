// Configuração do servidor (tabela rpg.config). Puro TS.
import type { GameRules, ServerConfig } from "../contracts/types";

export const DEFAULT_RULES: GameRules = {
  death_xp_loss: 0.1,
  death_skill_loss: 0.1,
  respawn_seconds: 30,
  xp_rate: 1,
  skill_rate: 1,
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  serverName: "Venore",
  motd: "Bem-vindo a Venore!",
  minClientVersion: "0.4.0",
  latestClientVersion: "0.4.0",
  downloadUrl: "",
  gameServerUrl: "",
  rules: DEFAULT_RULES,
};

export const RULE_LIMITS: Record<keyof GameRules, { label: string; min: number; max: number }> = {
  death_xp_loss: { label: "Perda de XP na morte (0–1)", min: 0, max: 1 },
  death_skill_loss: { label: "Perda de progresso de skill na morte (0–1)", min: 0, max: 1 },
  respawn_seconds: { label: "Respawn dos monstros (segundos)", min: 1, max: 3600 },
  xp_rate: { label: "Multiplicador de XP", min: 0.1, max: 100 },
  skill_rate: { label: "Multiplicador de treino de skill", min: 0.1, max: 100 },
};

/** Mistura o que está gravado com os padrões (chaves desconhecidas são ignoradas). */
export function mergeServerConfig(stored: Partial<Record<keyof ServerConfig, unknown>>): ServerConfig {
  const rules = { ...DEFAULT_RULES };
  const storedRules = (stored.rules ?? {}) as Partial<Record<keyof GameRules, unknown>>;
  for (const key of Object.keys(DEFAULT_RULES) as (keyof GameRules)[]) {
    const n = Number(storedRules[key]);
    if (Number.isFinite(n)) rules[key] = n;
  }
  const text = (key: keyof ServerConfig) =>
    typeof stored[key] === "string" ? (stored[key] as string) : (DEFAULT_SERVER_CONFIG[key] as string);
  return {
    serverName: text("serverName"),
    motd: text("motd"),
    minClientVersion: text("minClientVersion"),
    latestClientVersion: text("latestClientVersion"),
    downloadUrl: text("downloadUrl"),
    gameServerUrl: text("gameServerUrl"),
    rules,
  };
}
