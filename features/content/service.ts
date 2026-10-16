import { beginOperation } from "@venore/plugin-sdk/observability";
import { buildPack, checkPack } from "../../shared/build-pack";
import { opFail, opOk } from "../../shared/operation";
import { getServerConfig } from "../config/service";
import {
  deleteEntry,
  entryExists,
  insertVersion,
  selectEntries,
  selectLatestVersion,
  selectVersions,
  upsertEntry,
} from "./store";
import type { ContentKind } from "../../contracts/types";
import type {
  DeleteEntryResult,
  GetPublishedContentResult,
  ListEntriesResult,
  ListVersionsResult,
  PublishContentResult,
  SaveEntryCommand,
  SaveEntryResult,
} from "./types";

export async function listEntries(kind?: ContentKind): Promise<ListEntriesResult> {
  return { success: true, data: await selectEntries(kind) };
}

export async function saveEntry(command: SaveEntryCommand): Promise<SaveEntryResult> {
  const handle = beginOperation({ useCase: "rpg.save-entry", actor: { id: command.actorId, type: "user" }, kind: "write" });
  if (command.isNew && (await entryExists(command.kind, command.key))) {
    return opFail(handle, { code: "rpg.key_taken", message: `Já existe um registro com a chave "${command.key}".` });
  }
  await upsertEntry({ kind: command.kind, key: command.key, data: command.data, actorId: command.actorId });
  return opOk(handle, { kind: command.kind, key: command.key });
}

export async function removeEntry(command: { kind: ContentKind; key: string; actorId: string }): Promise<DeleteEntryResult> {
  const handle = beginOperation({ useCase: "rpg.delete-entry", actor: { id: command.actorId, type: "user" }, kind: "write" });
  if (!(await deleteEntry(command.kind, command.key))) {
    return opFail(handle, { code: "rpg.not_found", message: "Registro não encontrado." });
  }
  return opOk(handle, undefined);
}

/** Monta o pacote a partir do rascunho, confere as referências e grava como nova versão. */
export async function publishContent(command: { notes: string | null; actorId: string }): Promise<PublishContentResult> {
  const handle = beginOperation({ useCase: "rpg.publish-content", actor: { id: command.actorId, type: "user" }, kind: "write" });
  const [entries, config] = await Promise.all([selectEntries(), getServerConfig()]);
  if (!config.success) return opFail(handle, config.error);
  const pack = buildPack(entries, config.data.rules, "0");
  const errors = checkPack(pack);
  if (errors.length > 0) {
    return opFail(handle, { code: "rpg.invalid_pack", message: errors.map((e) => e.message).join(" ") });
  }
  const version = await insertVersion({ pack, notes: command.notes, actorId: command.actorId });
  return opOk(handle, { version });
}

export async function getPublishedContent(): Promise<GetPublishedContentResult> {
  const latest = await selectLatestVersion();
  return { success: true, data: latest ? latest.pack : null };
}

export async function getLatestVersionNumber(): Promise<number | null> {
  const latest = await selectLatestVersion();
  return latest ? latest.version : null;
}

export async function listVersions(limit = 20): Promise<ListVersionsResult> {
  const rows = await selectVersions(limit);
  return {
    success: true,
    data: rows.map((r) => {
      const pack = r.pack as { items?: object; monsters?: object; npcs?: object };
      return {
        version: r.version,
        notes: r.notes,
        publishedByUserId: r.publishedByUserId,
        publishedAt: r.publishedAt,
        counts: {
          items: Object.keys(pack.items ?? {}).length,
          monsters: Object.keys(pack.monsters ?? {}).length,
          npcs: Object.keys(pack.npcs ?? {}).length,
        },
      };
    }),
  };
}
