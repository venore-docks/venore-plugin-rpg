"use client";

import { useActionState } from "react";
import { Ban, Rocket, ShieldCheck } from "lucide-react";
import { Button, Input, Textarea, useActionToast } from "@venore/plugin-sdk/ui";
import { RULE_LIMITS } from "../../shared/config";
import type { GameRules, ServerConfig } from "../../contracts/types";
import {
  publishAction,
  setBannedAction,
  updateConfigAction,
  type PublishActionState,
  type RpgActionState,
} from "./actions";

const fieldClass = "flex flex-col gap-1 text-sm text-muted-foreground";
const initial: RpgActionState = { error: null };

export function ServerConfigForm({ config }: { config: ServerConfig }) {
  const [state, formAction, pending] = useActionState(updateConfigAction, initial);
  useActionToast({ pending, error: state.error, successMessage: "Configuração salva." });
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={fieldClass}>
          Nome do servidor
          <Input name="serverName" defaultValue={config.serverName} required />
        </label>
        <label className={fieldClass}>
          Servidor de jogo (wss://…)
          <Input name="gameServerUrl" defaultValue={config.gameServerUrl} placeholder="vazio = ainda não existe" />
        </label>
        <label className={fieldClass}>
          Versão mínima do app
          <Input name="minClientVersion" defaultValue={config.minClientVersion} required pattern="\d+\.\d+\.\d+" />
          <span className="text-xs">Apps abaixo disso são obrigados a atualizar antes de logar.</span>
        </label>
        <label className={fieldClass}>
          Versão mais recente do app
          <Input name="latestClientVersion" defaultValue={config.latestClientVersion} required pattern="\d+\.\d+\.\d+" />
        </label>
        <label className={`${fieldClass} sm:col-span-2`}>
          Link para baixar o app
          <Input name="downloadUrl" defaultValue={config.downloadUrl} placeholder="https://…/venore.apk" />
        </label>
        <label className={`${fieldClass} sm:col-span-2`}>
          Mensagem do dia
          <Textarea name="motd" defaultValue={config.motd} rows={2} />
        </label>
      </div>
      <p className="pt-2 text-xs font-medium uppercase tracking-caps text-muted-foreground">Regras do jogo</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(RULE_LIMITS) as (keyof GameRules)[]).map((key) => (
          <label key={key} className={fieldClass}>
            {RULE_LIMITS[key].label}
            <Input
              name={`rules.${key}`}
              type="number"
              step="any"
              min={RULE_LIMITS[key].min}
              max={RULE_LIMITS[key].max}
              defaultValue={config.rules[key]}
              required
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">As regras entram no jogo na próxima versão publicada.</p>
      <Button type="submit" disabled={pending}>
        Salvar configuração
      </Button>
    </form>
  );
}

const initialPublish: PublishActionState = { error: null, version: null };

export function PublishForm() {
  const [state, formAction, pending] = useActionState(publishAction, initialPublish);
  useActionToast({
    pending,
    error: state.error,
    successMessage: state.version ? `Versão ${state.version} publicada. O app baixa na próxima abertura.` : "Publicado.",
  });
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <Input name="notes" placeholder="O que mudou nesta versão (opcional)" className="sm:flex-1" />
      <Button type="submit" disabled={pending}>
        <Rocket className="size-4" />
        Publicar versão
      </Button>
    </form>
  );
}

export function BanButton({ accountId, banned, name }: { accountId: number; banned: boolean; name: string }) {
  const [state, formAction, pending] = useActionState(setBannedAction, initial);
  useActionToast({ pending, error: state.error, successMessage: banned ? `${name} desbloqueada.` : `${name} bloqueada.` });
  return (
    <form action={formAction}>
      <input type="hidden" name="accountId" value={accountId} />
      <input type="hidden" name="banned" value={banned ? "false" : "true"} />
      <Button type="submit" variant={banned ? "outline" : "ghost"} size="sm" disabled={pending}>
        {banned ? <ShieldCheck className="size-4" /> : <Ban className="size-4" />}
        {banned ? "Desbloquear" : "Bloquear"}
      </Button>
    </form>
  );
}
