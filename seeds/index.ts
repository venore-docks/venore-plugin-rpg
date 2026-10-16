import type { PluginSeedFn } from "@venore/plugin-sdk";
import { seedInitialContent } from "./initial-content";

// A chave bate com manifest.seeds (platform/plugin-engine/plugin-seed-registry.ts do core).
export const rpgSeeds: Record<string, PluginSeedFn> = {
  "initial-content": seedInitialContent,
};
