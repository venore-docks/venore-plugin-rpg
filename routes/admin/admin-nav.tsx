import Link from "next/link";
import { Button } from "@venore/plugin-sdk/ui";

const TABS = [
  { href: "/admin/rpg", label: "Visão geral" },
  { href: "/admin/rpg/items", label: "Itens" },
  { href: "/admin/rpg/monsters", label: "Monstros" },
  { href: "/admin/rpg/npcs", label: "NPCs" },
  { href: "/admin/rpg/accounts", label: "Contas" },
];

export function RpgAdminNav({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Button key={tab.href} asChild variant={tab.href === current ? "default" : "outline"} size="sm">
          <Link href={tab.href}>{tab.label}</Link>
        </Button>
      ))}
    </nav>
  );
}
