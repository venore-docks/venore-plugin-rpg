import { describe, expect, it } from "vitest";
import { buildPack, checkPack } from "./build-pack";
import { DEFAULT_RULES, mergeServerConfig } from "./config";
import { coerceFields } from "./content-fields";
import { lootRowsFromData, npcListsFromData, parseLoot, parseNpcLists } from "./lists";
import { compareVersions, isValidVersion } from "./version";
import { DEFAULT_CONTENT } from "../seeds/default-content";
import type { ContentEntry } from "../contracts/types";

describe("compareVersions", () => {
  it("compara numericamente, não como texto", () => {
    expect(compareVersions("0.10.0", "0.9.0")).toBe(1);
    expect(compareVersions("0.4.0", "0.4.0")).toBe(0);
    expect(compareVersions("0.3.9", "0.4.0")).toBe(-1);
  });
  it("versão inválida conta como a menor possível", () => {
    expect(isValidVersion("1.2")).toBe(false);
    expect(compareVersions("abc", "0.0.1")).toBe(-1);
  });
});

describe("coerceFields", () => {
  it("converte números, ignora vazios opcionais e marca booleanos", () => {
    const r = coerceFields("item", { name: " clava ", type: "weapon", weight: "25", atk: "7", stack: "on", slot: "" });
    expect(r).toEqual({ data: { name: "clava", type: "weapon", weight: 25, atk: 7, stack: true } });
  });
  it("recusa obrigatório vazio, número fora da faixa e opção inexistente", () => {
    expect("error" in coerceFields("item", { name: "", type: "weapon", weight: "1" })).toBe(true);
    expect("error" in coerceFields("monster", { name: "r", hp: "0", xp: "1", attack: "1", defense: "1", armor: "1", speed: "1", sight: "3", corpse: "x" })).toBe(true);
    expect("error" in coerceFields("item", { name: "x", type: "sword", weight: "1" })).toBe(true);
  });
});

describe("listas", () => {
  it("loot: valida chance e quantidade e ida/volta com o formulário", () => {
    const parsed = parseLoot([{ item: "gold_coin", chance: 0.9, min: 1, max: 4 }, { item: "" }]);
    expect(parsed).toEqual({ loot: [["gold_coin", 0.9, 1, 4]] });
    expect("error" in parseLoot([{ item: "x", chance: 2, min: 1, max: 1 }])).toBe(true);
    expect(lootRowsFromData({ loot: [["gold_coin", 0.9, 1, 4]] })).toEqual([{ item: "gold_coin", chance: 0.9, min: 1, max: 4 }]);
  });
  it("NPC: falas e comércio viram o formato do pacote", () => {
    const parsed = parseNpcLists({
      topics: [{ question: "Ratos?", answer: "Compro." }],
      buys: [{ item: "dead_rat", price: 2 }],
      sells: [],
    });
    expect(parsed).toEqual({ lists: { topics: [["Ratos?", "Compro."]], buys: { dead_rat: 2 }, sells: {} } });
    expect("error" in parseNpcLists({ topics: [{ question: "Oi", answer: "" }] })).toBe(true);
    expect(npcListsFromData({ topics: [["a", "b"]], buys: { x: 1 } }).buys).toEqual([{ item: "x", price: 1 }]);
  });
});

describe("pacote", () => {
  const entries: ContentEntry[] = [
    ...Object.entries(DEFAULT_CONTENT.items).map(([key, data]) => ({ kind: "item" as const, key, data, updatedAt: new Date() })),
    ...Object.entries(DEFAULT_CONTENT.monsters).map(([key, data]) => ({ kind: "monster" as const, key, data, updatedAt: new Date() })),
    ...Object.entries(DEFAULT_CONTENT.npcs).map(([key, data]) => ({ kind: "npc" as const, key, data, updatedAt: new Date() })),
  ];

  it("o conteúdo inicial do protótipo monta um pacote válido", () => {
    const pack = buildPack(entries, DEFAULT_RULES, "1");
    expect(checkPack(pack)).toEqual([]);
    expect(Object.keys(pack.monsters).sort()).toEqual(["cave_rat", "rat"]);
  });

  it("acusa loot e comércio apontando para item inexistente", () => {
    const broken = entries.filter((e) => e.key !== "dead_rat" && e.key !== "cheese");
    const messages = checkPack(buildPack(broken, DEFAULT_RULES, "1")).map((e) => e.code);
    expect(messages).toContain("rpg.bad_corpse");
    expect(messages).toContain("rpg.bad_loot");
    expect(messages).toContain("rpg.bad_trade");
  });

  it("configuração salva parcialmente cai nos padrões", () => {
    const c = mergeServerConfig({ serverName: "X", rules: { xp_rate: 2 } });
    expect(c.serverName).toBe("X");
    expect(c.rules.xp_rate).toBe(2);
    expect(c.rules.death_xp_loss).toBe(DEFAULT_RULES.death_xp_loss);
  });
});
