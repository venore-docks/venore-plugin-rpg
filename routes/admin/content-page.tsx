import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import {
  AdminAccessDenied,
  AdminPageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@venore/plugin-sdk/ui";
import { listContentEntries, type ContentEntry, type ContentKind } from "../../index";
import { KIND_LABELS } from "../../shared/content-fields";
import { RpgAdminNav } from "./admin-nav";
import { DeleteEntryButton, EntryDialog } from "./entry-dialog";

function summary(entry: ContentEntry): string {
  const d = entry.data;
  if (entry.kind === "item") {
    return [d.type, d.slot, `${d.weight} oz`, d.atk !== undefined ? `atk ${d.atk}` : null, d.arm !== undefined ? `arm ${d.arm}` : null]
      .filter(Boolean)
      .join(" · ");
  }
  if (entry.kind === "monster") {
    return `vida ${d.hp} · xp ${d.xp} · dano ${d.attack} · ${(d.loot as unknown[] | undefined)?.length ?? 0} drops`;
  }
  return `${d.title} · marcador "${d.marker}" · ${(d.topics as unknown[] | undefined)?.length ?? 0} falas`;
}

async function ContentPage({ kind }: { kind: ContentKind }) {
  const gate = await getPluginAdminPageData("rpg");
  if (!gate.granted) return <AdminAccessDenied message="Você não tem permissão para administrar o RPG." />;
  const labels = KIND_LABELS[kind];
  const [result, items] = await Promise.all([listContentEntries(kind), listContentEntries("item")]);
  const itemKeys = items.success ? items.data.map((e) => e.key) : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={labels.plural}
        description="Rascunho do conteúdo. O jogo só recebe depois de publicar na visão geral."
        actions={<EntryDialog kind={kind} itemKeys={itemKeys} />}
      />
      <RpgAdminNav current={`/admin/rpg/${labels.path}`} />
      {!result.success ? (
        <p className="text-sm text-destructive">{result.error.message}</p>
      ) : (
        <div className="rounded-panel border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chave</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Resumo</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((entry) => (
                <TableRow key={entry.key}>
                  <TableCell className="font-mono text-foreground">{entry.key}</TableCell>
                  <TableCell>{String(entry.data.name ?? "")}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{summary(entry)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EntryDialog kind={kind} entryKey={entry.key} data={entry.data} itemKeys={itemKeys} />
                      <DeleteEntryButton kind={kind} entryKey={entry.key} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function RpgItemsPage() {
  return <ContentPage kind="item" />;
}
export function RpgMonstersPage() {
  return <ContentPage kind="monster" />;
}
export function RpgNpcsPage() {
  return <ContentPage kind="npc" />;
}
