// Barrel do plugin RPG: único ponto que o core (e outros plugins) importam.
export { rpgBreadcrumbSegments } from "./breadcrumbs";
export { rpgSeeds } from "./seeds";

export {
  listEntriesHandler as listContentEntries,
  saveEntryHandler as saveContentEntry,
  deleteEntryHandler as deleteContentEntry,
  publishContentHandler as publishContent,
  listVersionsHandler as listContentVersions,
  getPublishedContentHandler as getPublishedContent,
} from "./features/content/handler";
export { getServerConfigHandler as getServerConfig, updateServerConfigHandler as updateServerConfig } from "./features/config/handler";
export { getPublicStatusHandler as getPublicStatus } from "./features/status/handler";
export {
  registerAccountHandler as registerAccount,
  loginHandler as login,
  createCharacterHandler as createCharacter,
  listAccountsHandler as listAccounts,
  setAccountBannedHandler as setAccountBanned,
} from "./features/accounts/handler";

export type {
  AccountAdminView,
  CharacterSummary,
  ContentEntry,
  ContentKind,
  ContentPack,
  ContentVersionSummary,
  GameRules,
  LoginResponse,
  ServerConfig,
} from "./contracts/types";
export type { PublicStatus } from "./features/status/handler";
