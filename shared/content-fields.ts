// Campos aceitos em cada tipo de conteúdo. Puro TypeScript (sem db): usado na validação do
// service e para montar os formulários do admin. Espelha o que o app entende — os nomes dos
// campos são os do pacote (data/content_default.json no repo do jogo).
import type { ContentKind } from "../contracts/types";

export type FieldType = "text" | "textarea" | "int" | "float" | "bool" | "select";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  min?: number;
  max?: number;
  help?: string;
};

export const ITEM_TYPES = [
  "weapon", "shield", "armor", "helmet", "legs", "boots", "container", "food", "currency", "corpse", "key", "misc",
] as const;
export const ITEM_SLOTS = ["", "head", "neck", "back", "body", "right", "left", "legs", "feet", "ring", "ammo"] as const;
export const WEAPON_SKILLS = ["", "club", "sword", "axe"] as const;
export const ARMOR_SKILLS = ["", "armor_light", "armor_medium", "armor_heavy"] as const;
export const SHIELD_SKILLS = ["", "shield_light", "shield_heavy"] as const;

export const ITEM_FIELDS: readonly FieldDef[] = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "plural", label: "Plural (itens empilháveis)", type: "text" },
  { name: "type", label: "Tipo", type: "select", options: ITEM_TYPES, required: true },
  { name: "slot", label: "Slot de equipamento", type: "select", options: ITEM_SLOTS },
  { name: "weight", label: "Peso (oz)", type: "float", required: true, min: 0, max: 100000 },
  { name: "stack", label: "Empilhável", type: "bool" },
  { name: "atk", label: "Ataque", type: "int", min: 0, max: 1000 },
  { name: "def", label: "Defesa", type: "int", min: 0, max: 1000 },
  { name: "arm", label: "Armadura", type: "int", min: 0, max: 1000 },
  { name: "speed", label: "Bônus de velocidade", type: "int", min: -500, max: 500 },
  { name: "capacity", label: "Capacidade (containers e corpos)", type: "int", min: 1, max: 100 },
  { name: "regen", label: "Alimenta por (segundos)", type: "int", min: 0, max: 3600 },
  { name: "decay", label: "Some do chão após (segundos)", type: "float", min: 0, max: 86400 },
  { name: "pickup", label: "Pode ser pego (corpos)", type: "bool" },
  { name: "wtype", label: "Skill de arma", type: "select", options: WEAPON_SKILLS },
  { name: "atype", label: "Skill de armadura", type: "select", options: ARMOR_SKILLS },
  { name: "stype", label: "Skill de escudo", type: "select", options: SHIELD_SKILLS },
  { name: "desc", label: "Descrição", type: "textarea" },
  { name: "icon", label: "Ícone (caminho no app, opcional)", type: "text", help: "Ex.: dcss/items/club.png" },
];

export const MONSTER_FIELDS: readonly FieldDef[] = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "hp", label: "Vida", type: "int", required: true, min: 1, max: 1000000 },
  { name: "xp", label: "Experiência", type: "int", required: true, min: 0, max: 10000000 },
  { name: "attack", label: "Dano máximo (corpo a corpo)", type: "int", required: true, min: 0, max: 100000 },
  { name: "defense", label: "Defesa", type: "int", required: true, min: 0, max: 1000 },
  { name: "armor", label: "Armadura", type: "int", required: true, min: 0, max: 1000 },
  { name: "speed", label: "Velocidade", type: "int", required: true, min: 1, max: 2000 },
  { name: "flee_hp", label: "Foge com vida em", type: "int", min: 0, max: 1000000 },
  { name: "sight", label: "Alcance de visão (tiles)", type: "int", required: true, min: 1, max: 15 },
  { name: "corpse", label: "Corpo (chave do item)", type: "text", required: true },
  { name: "look", label: "Aparência (chave do sprite no app)", type: "text" },
];

export const NPC_FIELDS: readonly FieldDef[] = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "title", label: "Título", type: "text", required: true, help: "Ex.: o curtidor" },
  { name: "marker", label: "Marcador no mapa", type: "text", required: true, help: "Caractere do NPC em data/test_map.txt" },
  { name: "look", label: "Aparência (chave no app)", type: "text", required: true, help: "tanner ou merchant" },
  { name: "greet", label: "Saudação", type: "textarea", required: true, help: "%s vira o nome do jogador" },
];

export const FIELDS_BY_KIND: Record<ContentKind, readonly FieldDef[]> = {
  item: ITEM_FIELDS,
  monster: MONSTER_FIELDS,
  npc: NPC_FIELDS,
};

export const KIND_LABELS: Record<ContentKind, { singular: string; plural: string; path: string }> = {
  item: { singular: "Item", plural: "Itens", path: "items" },
  monster: { singular: "Monstro", plural: "Monstros", path: "monsters" },
  npc: { singular: "NPC", plural: "NPCs", path: "npcs" },
};

/** Valor do "nenhum" nos selects do admin (o Select do shadcn não aceita valor vazio). */
export const NONE_OPTION = "__none";

export const CONTENT_KEY_PATTERN = /^[a-z][a-z0-9_]{1,39}$/;

export type FieldError = { code: string; message: string };

/** Converte e valida os campos escalares. Campos vazios/ausentes que não são obrigatórios somem. */
export function coerceFields(
  kind: ContentKind,
  raw: Record<string, unknown>,
): { data: Record<string, unknown> } | { error: FieldError } {
  const data: Record<string, unknown> = {};
  for (const field of FIELDS_BY_KIND[kind]) {
    const value = raw[field.name];
    const empty = value === undefined || value === null || (typeof value === "string" && value.trim() === "");
    if (field.type === "bool") {
      if (value === true || value === "true" || value === "on") data[field.name] = true;
      continue;
    }
    if (empty) {
      if (field.required) {
        return { error: { code: "rpg.field_required", message: `${field.label}: obrigatório.` } };
      }
      continue;
    }
    if (field.type === "int" || field.type === "float") {
      const n = Number(value);
      if (!Number.isFinite(n) || (field.type === "int" && !Number.isInteger(n))) {
        return { error: { code: "rpg.field_number", message: `${field.label}: número inválido.` } };
      }
      if ((field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max)) {
        return { error: { code: "rpg.field_range", message: `${field.label}: fora da faixa ${field.min}–${field.max}.` } };
      }
      data[field.name] = n;
      continue;
    }
    const text = String(value).trim();
    if (field.type === "select" && field.options && !field.options.includes(text)) {
      return { error: { code: "rpg.field_option", message: `${field.label}: opção inválida (${text}).` } };
    }
    if (text !== "") data[field.name] = text;
  }
  return { data };
}
