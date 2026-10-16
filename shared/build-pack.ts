// Monta e confere o pacote de conteúdo a partir do rascunho. Puro TS.
import type { ContentEntry, ContentPack, GameRules } from "../contracts/types";
import type { FieldError } from "./content-fields";

// O app recusa um pacote sem estes itens (Game.apply_content no repo do jogo).
export const REQUIRED_ITEMS = ["bag", "club", "coat", "gold_coin", "dead_human"] as const;

export function buildPack(entries: ContentEntry[], rules: GameRules, version: string): ContentPack {
  const pack: ContentPack = { schema: 1, version, items: {}, monsters: {}, npcs: {}, rules };
  for (const e of entries) {
    if (e.kind === "item") pack.items[e.key] = e.data;
    else if (e.kind === "monster") pack.monsters[e.key] = e.data;
    else pack.npcs[e.key] = e.data;
  }
  return pack;
}

/** Referências cruzadas: corpos, loot e comércio só podem apontar para itens que existem. */
export function checkPack(pack: ContentPack): FieldError[] {
  const errors: FieldError[] = [];
  const has = (id: unknown) => typeof id === "string" && id in pack.items;
  for (const id of REQUIRED_ITEMS) {
    if (!has(id)) errors.push({ code: "rpg.required_item", message: `Falta o item obrigatório "${id}".` });
  }
  for (const [key, m] of Object.entries(pack.monsters)) {
    if (!has(m.corpse)) errors.push({ code: "rpg.bad_corpse", message: `Monstro "${key}": corpo "${String(m.corpse)}" não existe.` });
    else if (pack.items[String(m.corpse)].type !== "corpse") {
      errors.push({ code: "rpg.bad_corpse", message: `Monstro "${key}": "${String(m.corpse)}" não é do tipo corpo.` });
    }
    for (const row of (Array.isArray(m.loot) ? m.loot : []) as unknown[][]) {
      if (!has(row[0])) errors.push({ code: "rpg.bad_loot", message: `Monstro "${key}": item de loot "${String(row[0])}" não existe.` });
    }
  }
  for (const [key, n] of Object.entries(pack.npcs)) {
    for (const list of ["buys", "sells"] as const) {
      for (const item of Object.keys((n[list] ?? {}) as Record<string, unknown>)) {
        if (!has(item)) errors.push({ code: "rpg.bad_trade", message: `NPC "${key}": item "${item}" no comércio não existe.` });
      }
    }
  }
  return errors;
}
