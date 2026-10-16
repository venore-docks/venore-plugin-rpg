import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import {
  AdminAccessDenied,
  AdminPageHeader,
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@venore/plugin-sdk/ui";
import { listAccounts } from "../../index";
import { RpgAdminNav } from "./admin-nav";
import { BanButton } from "./server-forms";

export default async function RpgAccountsPage() {
  const gate = await getPluginAdminPageData("rpg");
  if (!gate.granted) return <AdminAccessDenied message="Você não tem permissão para ver as contas." />;
  const result = await listAccounts();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Contas" description="Contas criadas pelo app. Bloquear derruba as sessões abertas." />
      <RpgAdminNav current="/admin/rpg/accounts" />
      {!result.success ? (
        <p className="text-sm text-destructive">{result.error.message}</p>
      ) : result.data.length === 0 ? (
        <EmptyState title="Nenhuma conta ainda" description="As contas aparecem aqui quando alguém se cadastra pelo app." />
      ) : (
        <div className="rounded-panel border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead>Personagens</TableHead>
                <TableHead className="hidden sm:table-cell">Último login</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-foreground">
                    {a.name} {a.banned && <Badge variant="destructive">bloqueada</Badge>}
                  </TableCell>
                  <TableCell>
                    {a.characters.length === 0 ? "—" : a.characters.map((c) => `${c.name} (nv ${c.level})`).join(", ")}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {a.lastLoginAt ? a.lastLoginAt.toLocaleString("pt-BR") : "nunca"}
                  </TableCell>
                  <TableCell className="text-right">
                    <BanButton accountId={a.id} banned={a.banned} name={a.name} />
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
