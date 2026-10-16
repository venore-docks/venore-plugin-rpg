// Tipos públicos do plugin RPG (podem ser importados por outros plugins via barrel).

export type ContentKind = "item" | "monster" | "npc";

export type ContentEntry = {
  kind: ContentKind;
  key: string;
  data: Record<string, unknown>;
  updatedAt: Date;
};

export type GameRules = {
  death_xp_loss: number;
  death_skill_loss: number;
  respawn_seconds: number;
  xp_rate: number;
  skill_rate: number;
};

export type ServerConfig = {
  serverName: string;
  motd: string;
  minClientVersion: string;
  latestClientVersion: string;
  downloadUrl: string;
  gameServerUrl: string;
  rules: GameRules;
};

/** Pacote servido ao app em GET /api/rpg/content (mesmo formato de data/content_default.json). */
export type ContentPack = {
  schema: 1;
  version: string;
  items: Record<string, Record<string, unknown>>;
  monsters: Record<string, Record<string, unknown>>;
  npcs: Record<string, Record<string, unknown>>;
  rules: GameRules;
};

export type ContentVersionSummary = {
  version: number;
  notes: string | null;
  publishedByUserId: string | null;
  publishedAt: Date;
  counts: { items: number; monsters: number; npcs: number };
};

export type CharacterSummary = { id: number; name: string; level: number };

export type AccountAdminView = {
  id: number;
  name: string;
  banned: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  characters: CharacterSummary[];
};

export type LoginResponse = {
  token: string;
  expiresAt: Date;
  account: { id: number; name: string };
  characters: CharacterSummary[];
};

/** Entrada de um jogador no servidor de jogo: conta + personagem com o último estado gravado. */
export type GameSession = {
  account: { id: number; name: string };
  character: { id: number; name: string; level: number; save: Record<string, unknown> | null };
};

/** Estado de um personagem enviado pelo servidor de jogo (save = JSON do jogo, opaco para o site). */
export type CharacterSaveInput = { id: number; level: number; save: Record<string, unknown> };

/** Batimento do servidor de jogo (a cada ~30 s enquanto está no ar). */
export type ServerHeartbeat = { players: string[]; serverVersion: string; contentVersion: string; publicUrl: string };

export type GameServerStatus = {
  online: boolean;
  lastSeenAt: string | null;
  players: string[];
  serverVersion: string | null;
  contentVersion: string | null;
  keyCreatedAt: string | null;
  /** Endereço que o próprio servidor de jogo anunciou (ex.: túnel que muda a cada reinício). */
  publicUrl: string | null;
};
