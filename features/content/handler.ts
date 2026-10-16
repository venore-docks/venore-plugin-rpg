import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getPublishedContent, listEntries, listVersions, publishContent, removeEntry, saveEntry } from "./service";
import { isContentKind, validateSaveEntryInput } from "./validation";
import type { ContentKind } from "../../contracts/types";
import type {
  DeleteEntryInput,
  DeleteEntryResult,
  GetPublishedContentResult,
  ListEntriesResult,
  ListVersionsResult,
  PublishContentInput,
  PublishContentResult,
  SaveEntryInput,
  SaveEntryResult,
} from "./types";

export async function listEntriesHandler(kind?: ContentKind): Promise<ListEntriesResult> {
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return listEntries(kind);
}

export async function saveEntryHandler(input: SaveEntryInput): Promise<SaveEntryResult> {
  const validated = validateSaveEntryInput(input);
  if ("error" in validated) return { success: false, error: validated.error };
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return saveEntry({ kind: input.kind, key: input.key, isNew: input.isNew, data: validated.data, actorId: authz.actorId });
}

export async function deleteEntryHandler(input: DeleteEntryInput): Promise<DeleteEntryResult> {
  if (!isContentKind(input.kind)) return { success: false, error: { code: "rpg.invalid_kind", message: "Tipo inválido." } };
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return removeEntry({ kind: input.kind, key: input.key, actorId: authz.actorId });
}

export async function publishContentHandler(input: PublishContentInput): Promise<PublishContentResult> {
  const notes = input.notes?.trim().slice(0, 500) || null;
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return publishContent({ notes, actorId: authz.actorId });
}

export async function listVersionsHandler(): Promise<ListVersionsResult> {
  const authz = await authorizeActor("rpg.manage");
  if (!authz.authorized) return { success: false, error: authz.error };
  return listVersions();
}

/** Público: o app baixa sem login. */
export async function getPublishedContentHandler(): Promise<GetPublishedContentResult> {
  return getPublishedContent();
}
