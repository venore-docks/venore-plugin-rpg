"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@venore/plugin-sdk";
import {
  deleteContentEntry,
  publishContent,
  rotateServerKey,
  saveContentEntry,
  setAccountBanned,
  updateServerConfig,
  type ContentKind,
  type GameRules,
} from "../../index";
import { FIELDS_BY_KIND, KIND_LABELS, NONE_OPTION as NONE } from "../../shared/content-fields";
import { DEFAULT_RULES } from "../../shared/config";

export type RpgActionState = { error: string | null };

const DISABLED = "O plugin RPG está desabilitado.";

function readKind(formData: FormData): ContentKind {
  return String(formData.get("kind") ?? "") as ContentKind;
}

export async function saveEntryAction(_prev: RpgActionState, formData: FormData): Promise<RpgActionState> {
  if (!(await isPluginActive("rpg"))) return { error: DISABLED };
  const kind = readKind(formData);
  const fields: Record<string, unknown> = {};
  for (const field of FIELDS_BY_KIND[kind] ?? []) {
    const value = formData.get(field.name);
    fields[field.name] = value === NONE ? "" : value;
  }
  let lists: unknown = undefined;
  const rawLists = formData.get("lists");
  if (typeof rawLists === "string" && rawLists !== "") {
    try {
      lists = JSON.parse(rawLists);
    } catch {
      return { error: "Listas inválidas." };
    }
  }
  const result = await saveContentEntry({
    kind,
    key: String(formData.get("key") ?? "").trim(),
    isNew: formData.get("isNew") === "true",
    fields,
    lists,
  });
  if (!result.success) return { error: result.error.message };
  revalidatePath(`/admin/rpg/${KIND_LABELS[kind]?.path ?? ""}`);
  revalidatePath("/admin/rpg");
  return { error: null };
}

export async function deleteEntryAction(_prev: RpgActionState, formData: FormData): Promise<RpgActionState> {
  if (!(await isPluginActive("rpg"))) return { error: DISABLED };
  const kind = readKind(formData);
  const result = await deleteContentEntry({ kind, key: String(formData.get("key") ?? "") });
  if (!result.success) return { error: result.error.message };
  revalidatePath(`/admin/rpg/${KIND_LABELS[kind]?.path ?? ""}`);
  revalidatePath("/admin/rpg");
  return { error: null };
}

export type PublishActionState = { error: string | null; version: number | null };

export async function publishAction(_prev: PublishActionState, formData: FormData): Promise<PublishActionState> {
  if (!(await isPluginActive("rpg"))) return { error: DISABLED, version: null };
  const result = await publishContent({ notes: String(formData.get("notes") ?? "") });
  if (!result.success) return { error: result.error.message, version: null };
  revalidatePath("/admin/rpg");
  return { error: null, version: result.data.version };
}

export async function updateConfigAction(_prev: RpgActionState, formData: FormData): Promise<RpgActionState> {
  if (!(await isPluginActive("rpg"))) return { error: DISABLED };
  const rules = { ...DEFAULT_RULES };
  for (const key of Object.keys(DEFAULT_RULES) as (keyof GameRules)[]) {
    rules[key] = Number(formData.get(`rules.${key}`));
  }
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const result = await updateServerConfig({
    serverName: text("serverName"),
    motd: text("motd"),
    minClientVersion: text("minClientVersion"),
    latestClientVersion: text("latestClientVersion"),
    downloadUrl: text("downloadUrl"),
    gameServerUrl: text("gameServerUrl"),
    rules,
  });
  if (!result.success) return { error: result.error.message };
  revalidatePath("/admin/rpg");
  return { error: null };
}

export async function setBannedAction(_prev: RpgActionState, formData: FormData): Promise<RpgActionState> {
  if (!(await isPluginActive("rpg"))) return { error: DISABLED };
  const result = await setAccountBanned({
    accountId: Number(formData.get("accountId")),
    banned: formData.get("banned") === "true",
  });
  if (!result.success) return { error: result.error.message };
  revalidatePath("/admin/rpg/accounts");
  return { error: null };
}

export type ServerKeyActionState = { error: string | null; key: string | null };

export async function rotateServerKeyAction(_prev: ServerKeyActionState, _formData: FormData): Promise<ServerKeyActionState> {
  if (!(await isPluginActive("rpg"))) return { error: DISABLED, key: null };
  const result = await rotateServerKey();
  if (!result.success) return { error: result.error.message, key: null };
  revalidatePath("/admin/rpg");
  return { error: null, key: result.data.key };
}
