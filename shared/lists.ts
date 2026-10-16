// Listas aninhadas do conteúdo (loot de monstro, falas e comércio de NPC). Puro TS.
import type { FieldError } from "./content-fields";

export type LootRow = { item: string; chance: number; min: number; max: number };
export type TopicRow = { question: string; answer: string };
export type TradeRow = { item: string; price: number };

export type NpcLists = { topics: TopicRow[]; buys: TradeRow[]; sells: TradeRow[] };

const MAX_ROWS = 50;

export function parseLoot(raw: unknown): { loot: [string, number, number, number][] } | { error: FieldError } {
  const rows = Array.isArray(raw) ? raw : [];
  if (rows.length > MAX_ROWS) return { error: { code: "rpg.too_many_rows", message: "Loot com linhas demais." } };
  const loot: [string, number, number, number][] = [];
  for (const row of rows as Partial<LootRow>[]) {
    const item = String(row.item ?? "").trim();
    if (item === "") continue;
    const chance = Number(row.chance);
    const min = Number(row.min ?? 1);
    const max = Number(row.max ?? min);
    if (!Number.isFinite(chance) || chance < 0 || chance > 1) {
      return { error: { code: "rpg.loot_chance", message: `Loot ${item}: chance deve ser entre 0 e 1.` } };
    }
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min || max > 100) {
      return { error: { code: "rpg.loot_amount", message: `Loot ${item}: quantidade mín/máx inválida.` } };
    }
    loot.push([item, chance, min, max]);
  }
  return { loot };
}

export function parseNpcLists(raw: unknown): { lists: { topics: [string, string][]; buys: Record<string, number>; sells: Record<string, number> } } | { error: FieldError } {
  const src = (raw && typeof raw === "object" ? raw : {}) as Partial<NpcLists>;
  const topics: [string, string][] = [];
  for (const t of (Array.isArray(src.topics) ? src.topics : []).slice(0, MAX_ROWS)) {
    const q = String(t?.question ?? "").trim();
    const a = String(t?.answer ?? "").trim();
    if (q === "" && a === "") continue;
    if (q === "" || a === "") return { error: { code: "rpg.topic_incomplete", message: "Cada fala precisa de pergunta e resposta." } };
    topics.push([q, a]);
  }
  const trades = (rows: unknown, label: string): Record<string, number> | FieldError => {
    const out: Record<string, number> = {};
    for (const r of (Array.isArray(rows) ? rows : []).slice(0, MAX_ROWS) as Partial<TradeRow>[]) {
      const item = String(r?.item ?? "").trim();
      if (item === "") continue;
      const price = Number(r?.price);
      if (!Number.isInteger(price) || price < 0 || price > 10000000) {
        return { code: "rpg.trade_price", message: `${label} ${item}: preço inválido.` };
      }
      out[item] = price;
    }
    return out;
  };
  const buys = trades(src.buys, "Compra");
  if ("code" in buys) return { error: buys as FieldError };
  const sells = trades(src.sells, "Venda");
  if ("code" in sells) return { error: sells as FieldError };
  return { lists: { topics, buys: buys as Record<string, number>, sells: sells as Record<string, number> } };
}

/** Converte o jsonb de um NPC de volta para as linhas que o formulário edita. */
export function npcListsFromData(data: Record<string, unknown>): NpcLists {
  const topics = (Array.isArray(data.topics) ? data.topics : []).map((t) => ({
    question: String((t as unknown[])[0] ?? ""),
    answer: String((t as unknown[])[1] ?? ""),
  }));
  const toRows = (v: unknown): TradeRow[] =>
    Object.entries((v && typeof v === "object" ? v : {}) as Record<string, unknown>).map(([item, price]) => ({
      item,
      price: Number(price),
    }));
  return { topics, buys: toRows(data.buys), sells: toRows(data.sells) };
}

export function lootRowsFromData(data: Record<string, unknown>): LootRow[] {
  return (Array.isArray(data.loot) ? data.loot : []).map((e) => {
    const row = e as unknown[];
    return { item: String(row[0] ?? ""), chance: Number(row[1] ?? 0), min: Number(row[2] ?? 1), max: Number(row[3] ?? 1) };
  });
}
