"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useActionToast,
} from "@venore/plugin-sdk/ui";
import { KIND_LABELS } from "../../shared/content-fields";
import type { ContentKind } from "../../contracts/types";
import { deleteEntryAction, type RpgActionState } from "./actions";
import { EntryForm } from "./entry-form";

export function EntryDialog({
  kind,
  entryKey,
  data,
  itemKeys,
}: {
  kind: ContentKind;
  entryKey?: string;
  data?: Record<string, unknown>;
  itemKeys: string[];
}) {
  const [open, setOpen] = useState(false);
  const label = KIND_LABELS[kind].singular;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {entryKey ? (
          <Button variant="ghost" size="icon" aria-label={`Editar ${entryKey}`}>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Novo {label.toLowerCase()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entryKey ? `${label}: ${entryKey}` : `Novo ${label.toLowerCase()}`}</DialogTitle>
          <DialogDescription>As mudanças ficam no rascunho até você publicar uma nova versão.</DialogDescription>
        </DialogHeader>
        <EntryForm kind={kind} entryKey={entryKey} data={data} itemKeys={itemKeys} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

const initialState: RpgActionState = { error: null };

export function DeleteEntryButton({ kind, entryKey }: { kind: ContentKind; entryKey: string }) {
  const [state, formAction, pending] = useActionState(deleteEntryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: `${entryKey} removido do rascunho.` });
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remover "${entryKey}" do rascunho?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="key" value={entryKey} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label={`Remover ${entryKey}`}>
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
