import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import {
  AdminAccessDenied,
  AdminPageHeader,
  AdminStatTile,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@venore/plugin-sdk/ui";
import { getServerConfig, listContentEntries, listContentVersions } from "../../index";
import { RpgAdminNav } from "./admin-nav";
import { PublishForm, ServerConfigForm } from "./server-forms";

export default async function RpgAdminHomePage() {
  const gate = await getPluginAdminPageData("rpg");
  if (!gate.granted) return <AdminAccessDenied message="Você não tem permissão para administrar o RPG." />;

  const [config, entries, versions] = await Promise.all([getServerConfig(), listContentEntries(), listContentVersions()]);
  if (!config.success || !entries.success || !versions.success) {
    const error = [config, entries, versions].find((r) => !r.success);
    return (
      <div className="space-y-6">
        <AdminPageHeader title="RPG" description="Servidor do MMORPG Venore." />
        <RpgAdminNav current="/admin/rpg" />
        <p className="text-sm text-destructive">{error && !error.success ? error.error.message : "Erro ao carregar."}</p>
      </div>
    );
  }

  const count = (kind: string) => entries.data.filter((e) => e.kind === kind).length;
  const latest = versions.data[0];
  const draftNewer = latest ? entries.data.some((e) => e.updatedAt > latest.publishedAt) : entries.data.length > 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="RPG"
        description="Conteúdo do jogo, versão do app e regras. O app baixa a última versão publicada ao abrir."
      />
      <RpgAdminNav current="/admin/rpg" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatTile label="Versão publicada" value={latest ? latest.version : "—"} />
        <AdminStatTile label="Itens" value={count("item")} />
        <AdminStatTile label="Monstros" value={count("monster")} />
        <AdminStatTile label="NPCs" value={count("npc")} />
      </div>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Publicar</h2>
          <p className="text-sm text-muted-foreground">
            {draftNewer
              ? "Há alterações no rascunho que o jogo ainda não recebeu."
              : "O rascunho está igual à versão publicada."}
          </p>
          <PublishForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Servidor e app</h2>
          <ServerConfigForm config={config.data} />
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Versões publicadas</h2>
        <div className="rounded-panel border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Versão</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="hidden sm:table-cell">Conteúdo</TableHead>
                <TableHead className="w-40">Publicada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.data.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="font-medium text-foreground">{v.version}</TableCell>
                  <TableCell>{v.notes ?? "—"}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {v.counts.items} itens · {v.counts.monsters} monstros · {v.counts.npcs} NPCs
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.publishedAt.toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
