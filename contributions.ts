import type { PluginContributions } from "@venore/plugin-sdk";
import { rpgBreadcrumbSegments } from "./breadcrumbs";
import { rpgSeeds } from "./seeds";

export const rpgContributions: PluginContributions = {
  breadcrumbSegments: rpgBreadcrumbSegments,
  seeds: rpgSeeds,
};
