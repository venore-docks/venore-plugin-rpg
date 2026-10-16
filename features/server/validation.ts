// Validação do que o servidor de jogo envia. Puro TS (testável sem banco).
import type { CharacterSaveInput, ServerHeartbeat } from "../../contracts/types";

type Parsed<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } };

export const MAX_SAVES_PER_CALL = 50;
export const MAX_SAVE_BYTES = 200_000;
const MAX_PLAYERS_LISTED = 500;

function bad<T>(message: string, code = "rpg.invalid_save"): Parsed<T> {
  return { ok: false, error: { code, message } };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateSaves(input: unknown): Parsed<CharacterSaveInput[]> {
  if (!Array.isArray(input) || input.length === 0) return bad("Envie a lista characters.");
  if (input.length > MAX_SAVES_PER_CALL) return bad(`No máximo ${MAX_SAVES_PER_CALL} personagens por chamada.`);
  const out: CharacterSaveInput[] = [];
  for (const raw of input) {
    if (!isRecord(raw)) return bad("Item inválido em characters.");
    const id = Number(raw.id);
    const level = Number(raw.level);
    if (!Number.isInteger(id) || id <= 0) return bad("id do personagem inválido.");
    if (!Number.isInteger(level) || level < 1 || level > 10_000) return bad(`Nível inválido para o personagem ${id}.`);
    if (!isRecord(raw.save)) return bad(`save do personagem ${id} precisa ser um objeto.`);
    if (JSON.stringify(raw.save).length > MAX_SAVE_BYTES) return bad(`save do personagem ${id} é grande demais.`);
    out.push({ id, level, save: raw.save });
  }
  return { ok: true, value: out };
}

export function validateHeartbeat(input: unknown): Parsed<ServerHeartbeat> {
  if (!isRecord(input)) return bad("Batimento inválido.", "rpg.invalid_heartbeat");
  const players = Array.isArray(input.players) ? input.players.slice(0, MAX_PLAYERS_LISTED).map((p) => String(p).slice(0, 40)) : [];
  const publicUrl = String(input.public_url ?? "").trim();
  if (publicUrl !== "" && !/^wss?:\/\/[^\s/]+(\/\S*)?$/.test(publicUrl)) {
    return bad("public_url precisa ser ws:// ou wss://.", "rpg.invalid_heartbeat");
  }
  return {
    ok: true,
    value: {
      players,
      serverVersion: String(input.server_version ?? "").slice(0, 20),
      contentVersion: String(input.content_version ?? "").slice(0, 20),
      publicUrl: publicUrl.slice(0, 300),
    },
  };
}
