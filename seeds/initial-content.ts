import type { OperationResult } from "@venore/plugin-sdk";
import { DEFAULT_SERVER_CONFIG } from "../shared/config";
import { updateServerConfig } from "../features/config/service";
import { getLatestVersionNumber, listEntries, publishContent, saveEntry } from "../features/content/service";
import { selectConfigRows } from "../features/config/store";
import { DEFAULT_CONTENT } from "./default-content";
import type { ContentKind } from "../contracts/types";

// Rodado via /admin/plugins. Chama services direto (sem sessão de usuário neste caminho, mesmo
// racional do seed do birthdays). Idempotente: não sobrescreve o que já existe e só publica a
// versão 1 se nenhuma versão tiver sido publicada.
const SEED_ACTOR_ID = "system-seed";

export async function seedInitialContent(): Promise<OperationResult<void>> {
  const existing = await listEntries();
  if (!existing.success) return existing;
  const have = new Set(existing.data.map((e) => `${e.kind}:${e.key}`));

  const groups: [ContentKind, Record<string, Record<string, unknown>>][] = [
    ["item", DEFAULT_CONTENT.items],
    ["monster", DEFAULT_CONTENT.monsters],
    ["npc", DEFAULT_CONTENT.npcs],
  ];
  for (const [kind, entries] of groups) {
    for (const [key, data] of Object.entries(entries)) {
      if (have.has(`${kind}:${key}`)) continue;
      const saved = await saveEntry({ kind, key, isNew: true, data, actorId: SEED_ACTOR_ID });
      if (!saved.success) return saved;
    }
  }

  if (Object.keys(await selectConfigRows()).length === 0) {
    const saved = await updateServerConfig({ config: DEFAULT_SERVER_CONFIG, actorId: SEED_ACTOR_ID });
    if (!saved.success) return saved;
  }

  if ((await getLatestVersionNumber()) === null) {
    const published = await publishContent({ notes: "Conteúdo inicial do protótipo", actorId: SEED_ACTOR_ID });
    if (!published.success) return published;
  }
  return { success: true, data: undefined };
}
