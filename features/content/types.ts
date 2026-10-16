import type { OperationResult } from "@venore/plugin-sdk";
import type { ContentEntry, ContentKind, ContentPack, ContentVersionSummary } from "../../contracts/types";

export type SaveEntryInput = {
  kind: ContentKind;
  key: string;
  /** true = criação (falha se a chave já existir); false = edição */
  isNew: boolean;
  fields: Record<string, unknown>;
  /** loot (monstro) ou falas/comércio (NPC), já como objeto */
  lists?: unknown;
};
export type SaveEntryCommand = { kind: ContentKind; key: string; isNew: boolean; data: Record<string, unknown>; actorId: string };

export type DeleteEntryInput = { kind: ContentKind; key: string };
export type PublishContentInput = { notes?: string };

export type ListEntriesResult = OperationResult<ContentEntry[]>;
export type SaveEntryResult = OperationResult<{ kind: ContentKind; key: string }>;
export type DeleteEntryResult = OperationResult<void>;
export type PublishContentResult = OperationResult<{ version: number }>;
export type GetPublishedContentResult = OperationResult<ContentPack | null>;
export type ListVersionsResult = OperationResult<ContentVersionSummary[]>;
