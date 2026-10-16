import { Badge, Card, CardContent } from "@venore/plugin-sdk/ui";
import type { GameServerStatus } from "../../contracts/types";
import { ServerKeyForm } from "./server-forms";

function when(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("pt-BR") : "nunca";
}

/** Estado do servidor de jogo (batimento a cada ~30 s) e a chave que ele usa para falar com o site. */
export function GameServerCard({ status, fixedUrl }: { status: GameServerStatus; fixedUrl: string }) {
  const url = fixedUrl !== "" ? fixedUrl : status.publicUrl;
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-caps text-muted-foreground">Servidor de jogo</h2>
          <Badge variant={status.online ? "default" : "outline"}>{status.online ? "No ar" : "Fora do ar"}</Badge>
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Endereço que o app usa</dt>
            <dd className="break-all font-mono text-foreground">{url ?? "—"}</dd>
            <dd className="text-xs text-muted-foreground">
              {fixedUrl !== "" ? "fixado em Servidor e app" : "anunciado pelo próprio servidor (campo vazio em Servidor e app)"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Último batimento</dt>
            <dd className="text-foreground">{when(status.lastSeenAt)}</dd>
            {status.serverVersion ? (
              <dd className="text-xs text-muted-foreground">
                servidor {status.serverVersion} · conteúdo v{status.contentVersion || "?"}
              </dd>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Jogadores online ({status.players.length})</dt>
            <dd className="text-foreground">{status.players.length > 0 ? status.players.join(", ") : "ninguém"}</dd>
          </div>
        </dl>
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">
            {status.keyCreatedAt
              ? `Chave do servidor criada em ${when(status.keyCreatedAt)}.`
              : "Nenhuma chave ainda: o servidor de jogo não consegue validar logins nem salvar personagens."}
          </p>
          <ServerKeyForm hasKey={status.keyCreatedAt !== null} />
        </div>
      </CardContent>
    </Card>
  );
}
