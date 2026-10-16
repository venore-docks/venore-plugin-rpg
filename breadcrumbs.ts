import type { BreadcrumbSegmentDefinition } from "@venore/plugin-sdk";
import { staticBreadcrumbSegment } from "@venore/plugin-sdk";

export const rpgBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "rpg.admin", segments: ["admin", "rpg"], label: "RPG" }),
  staticBreadcrumbSegment({ key: "rpg.admin.items", segments: ["admin", "rpg", "items"], label: "Itens" }),
  staticBreadcrumbSegment({ key: "rpg.admin.monsters", segments: ["admin", "rpg", "monsters"], label: "Monstros" }),
  staticBreadcrumbSegment({ key: "rpg.admin.npcs", segments: ["admin", "rpg", "npcs"], label: "NPCs" }),
  staticBreadcrumbSegment({ key: "rpg.admin.accounts", segments: ["admin", "rpg", "accounts"], label: "Contas" }),
];
