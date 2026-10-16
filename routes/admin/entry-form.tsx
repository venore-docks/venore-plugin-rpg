"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Textarea, useActionToast } from "@venore/plugin-sdk/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@venore/plugin-sdk/ui";
// Módulos folha, sem banco (o barrel arrastaria o driver pg para o bundle do navegador).
import { FIELDS_BY_KIND, NONE_OPTION, type FieldDef } from "../../shared/content-fields";
import { lootRowsFromData, npcListsFromData, type LootRow, type NpcLists, type TradeRow } from "../../shared/lists";
import type { ContentKind } from "../../contracts/types";
import { saveEntryAction, type RpgActionState } from "./actions";

const initialState: RpgActionState = { error: null };

const fieldClass = "flex flex-col gap-1 text-sm text-muted-foreground";

function FieldInput({ field, value }: { field: FieldDef; value: unknown }) {
  const text = value === undefined || value === null ? "" : String(value);
  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name={field.name} defaultChecked={value === true} className="size-4 accent-primary" />
        {field.label}
      </label>
    );
  }
  let control;
  if (field.type === "select" && field.options) {
    control = (
      <Select name={field.name} defaultValue={text === "" ? NONE_OPTION : text}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt || NONE_OPTION} value={opt || NONE_OPTION}>
              {opt || "—"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else if (field.type === "textarea") {
    control = <Textarea name={field.name} defaultValue={text} rows={3} required={field.required} />;
  } else {
    const numeric = field.type === "int" || field.type === "float";
    control = (
      <Input
        name={field.name}
        defaultValue={text}
        type={numeric ? "number" : "text"}
        step={field.type === "float" ? "any" : numeric ? "1" : undefined}
        min={field.min}
        max={field.max}
        required={field.required}
        list={field.name === "corpse" ? "rpg-item-keys" : undefined}
      />
    );
  }
  return (
    <label className={fieldClass}>
      {field.label}
      {control}
      {field.help && <span className="text-xs">{field.help}</span>}
    </label>
  );
}

function RowsHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-caps text-muted-foreground">{title}</p>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-4" />
        Adicionar
      </Button>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} aria-label="Remover linha">
      <Trash2 className="size-4" />
    </Button>
  );
}

function LootEditor({ rows, onChange }: { rows: LootRow[]; onChange: (rows: LootRow[]) => void }) {
  const set = (i: number, patch: Partial<LootRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-2">
      <RowsHeader title="Loot (chance de 0 a 1)" onAdd={() => onChange([...rows, { item: "", chance: 0.5, min: 1, max: 1 }])} />
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2">
          <Input aria-label="Item" list="rpg-item-keys" value={row.item} onChange={(e) => set(i, { item: e.target.value })} />
          <Input aria-label="Chance" type="number" step="any" min={0} max={1} value={row.chance} onChange={(e) => set(i, { chance: Number(e.target.value) })} />
          <Input aria-label="Mínimo" type="number" min={0} value={row.min} onChange={(e) => set(i, { min: Number(e.target.value) })} />
          <Input aria-label="Máximo" type="number" min={0} value={row.max} onChange={(e) => set(i, { max: Number(e.target.value) })} />
          <RemoveButton onClick={() => onChange(rows.filter((_, j) => j !== i))} />
        </div>
      ))}
    </div>
  );
}

function TradeEditor({ title, rows, onChange }: { title: string; rows: TradeRow[]; onChange: (rows: TradeRow[]) => void }) {
  const set = (i: number, patch: Partial<TradeRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-2">
      <RowsHeader title={title} onAdd={() => onChange([...rows, { item: "", price: 1 }])} />
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[2fr_1fr_auto] gap-2">
          <Input aria-label="Item" list="rpg-item-keys" value={row.item} onChange={(e) => set(i, { item: e.target.value })} />
          <Input aria-label="Preço" type="number" min={0} value={row.price} onChange={(e) => set(i, { price: Number(e.target.value) })} />
          <RemoveButton onClick={() => onChange(rows.filter((_, j) => j !== i))} />
        </div>
      ))}
    </div>
  );
}

function NpcListsEditor({ lists, onChange }: { lists: NpcLists; onChange: (lists: NpcLists) => void }) {
  const setTopic = (i: number, patch: Partial<NpcLists["topics"][number]>) =>
    onChange({ ...lists, topics: lists.topics.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <RowsHeader title="Falas (opções de diálogo)" onAdd={() => onChange({ ...lists, topics: [...lists.topics, { question: "", answer: "" }] })} />
        {lists.topics.map((t, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
            <Input aria-label="Pergunta" value={t.question} onChange={(e) => setTopic(i, { question: e.target.value })} />
            <Textarea aria-label="Resposta" rows={2} value={t.answer} onChange={(e) => setTopic(i, { answer: e.target.value })} />
            <RemoveButton onClick={() => onChange({ ...lists, topics: lists.topics.filter((_, j) => j !== i) })} />
          </div>
        ))}
      </div>
      <TradeEditor title="NPC vende" rows={lists.sells} onChange={(sells) => onChange({ ...lists, sells })} />
      <TradeEditor title="NPC compra" rows={lists.buys} onChange={(buys) => onChange({ ...lists, buys })} />
    </div>
  );
}

export function EntryForm({
  kind,
  entryKey,
  data,
  itemKeys,
  onSuccess,
}: {
  kind: ContentKind;
  /** ausente = criação */
  entryKey?: string;
  data?: Record<string, unknown>;
  itemKeys: string[];
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveEntryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Salvo no rascunho. Publique para o jogo receber.", onSuccess });
  const values = data ?? {};
  const [loot, setLoot] = useState<LootRow[]>(() => lootRowsFromData(values));
  const [npcLists, setNpcLists] = useState<NpcLists>(() => npcListsFromData(values));
  const lists = kind === "monster" ? loot : kind === "npc" ? npcLists : null;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="isNew" value={entryKey ? "false" : "true"} />
      {lists && <input type="hidden" name="lists" value={JSON.stringify(lists)} />}
      <datalist id="rpg-item-keys">
        {itemKeys.map((k) => (
          <option key={k} value={k} />
        ))}
      </datalist>
      <label className={fieldClass}>
        Chave (identificador no jogo)
        <Input name="key" defaultValue={entryKey ?? ""} readOnly={Boolean(entryKey)} required pattern="[a-z][a-z0-9_]{1,39}" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS_BY_KIND[kind].map((field) => (
          <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
            <FieldInput field={field} value={values[field.name]} />
          </div>
        ))}
      </div>
      {kind === "monster" && <LootEditor rows={loot} onChange={setLoot} />}
      {kind === "npc" && <NpcListsEditor lists={npcLists} onChange={setNpcLists} />}
      <Button type="submit" disabled={pending} className="w-full">
        Salvar
      </Button>
    </form>
  );
}
