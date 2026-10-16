import { sql } from "drizzle-orm";
import { boolean, check, integer, jsonb, pgSchema, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

export const rpgSchema = pgSchema("rpg");

// Conteúdo em RASCUNHO. Cada item/monstro/NPC é uma linha com os atributos em jsonb — o mesmo
// formato do pacote que o app lê (data/content_default.json no repo do jogo). Os campos aceitos
// por tipo estão em shared/content-fields.ts e são validados no service antes de gravar.
// Nada aqui chega ao jogo até alguém publicar uma versão (content_versions).
export const contentEntries = rpgSchema.table(
  "content_entries",
  {
    kind: text("kind").notNull(),
    key: text("key").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    updatedByUserId: text("updated_by_user_id"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.kind, table.key] }),
    check("content_entries_kind_check", sql`${table.kind} in ('item', 'monster', 'npc')`),
  ],
);

// Pacotes publicados (imutáveis). O app baixa sempre o de maior versão.
export const contentVersions = rpgSchema.table("content_versions", {
  version: serial("version").primaryKey(),
  pack: jsonb("pack").$type<Record<string, unknown>>().notNull(),
  notes: text("notes"),
  publishedByUserId: text("published_by_user_id"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

// Configuração do servidor e regras do jogo (chave -> valor). Chaves em shared/config.ts.
export const config = rpgSchema.table("config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Contas de jogador (não são usuários do site). nameKey = nome em minúsculas, para unicidade.
export const accounts = rpgSchema.table("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKey: text("name_key").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  banned: boolean("banned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

// Sessões de login do app. Só o hash do token é guardado.
export const sessions = rpgSchema.table("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  accountId: integer("account_id").notNull(),
  clientVersion: text("client_version"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// Personagens. `save` é o estado do personagem gravado pelo servidor de jogo (fase 2).
export const characters = rpgSchema.table("characters", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  name: text("name").notNull(),
  nameKey: text("name_key").notNull().unique(),
  level: integer("level").notNull().default(1),
  save: jsonb("save").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});
