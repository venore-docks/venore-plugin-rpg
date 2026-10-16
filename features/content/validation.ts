import { CONTENT_KEY_PATTERN, coerceFields, type FieldError } from "../../shared/content-fields";
import { parseLoot, parseNpcLists } from "../../shared/lists";
import type { ContentKind } from "../../contracts/types";
import type { SaveEntryInput } from "./types";

const KINDS: readonly ContentKind[] = ["item", "monster", "npc"];

export function isContentKind(v: unknown): v is ContentKind {
  return typeof v === "string" && (KINDS as readonly string[]).includes(v);
}

/** Valida e converte a entrada do formulário no `data` jsonb que vai para o pacote. */
export function validateSaveEntryInput(input: SaveEntryInput): { data: Record<string, unknown> } | { error: FieldError } {
  if (!isContentKind(input.kind)) return { error: { code: "rpg.invalid_kind", message: "Tipo de conteúdo inválido." } };
  if (!CONTENT_KEY_PATTERN.test(input.key)) {
    return {
      error: { code: "rpg.invalid_key", message: "Chave: use 2 a 40 letras minúsculas, números ou _, começando por letra." },
    };
  }
  const coerced = coerceFields(input.kind, input.fields);
  if ("error" in coerced) return coerced;
  const data = coerced.data;
  if (input.kind === "monster") {
    const loot = parseLoot(input.lists);
    if ("error" in loot) return loot;
    data.loot = loot.loot;
  }
  if (input.kind === "npc") {
    const lists = parseNpcLists(input.lists);
    if ("error" in lists) return lists;
    if (String(data.marker ?? "").length !== 1) {
      return { error: { code: "rpg.invalid_marker", message: "Marcador no mapa: exatamente 1 caractere." } };
    }
    Object.assign(data, lists.lists);
  }
  return { data };
}
