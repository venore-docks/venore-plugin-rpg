// API do servidor de jogo (Godot headless). Toda chamada leva o header X-Server-Key com a chave
// gerada no admin (/admin/rpg). Contrato em docs/server-api.md no repo do jogo.
import { openGameSessionHandler, recordHeartbeatHandler, saveCharactersHandler } from "../../features/server/handler";
import { apiError, apiFromError, apiOk, readJsonBody } from "../../shared/http";
import { inactive } from "./app";

function serverKey(request: Request): string | null {
  return request.headers.get("x-server-key");
}

/** Jogador conectou no servidor de jogo: confere o token do app e devolve o personagem com o save. */
export async function serverSessionPOST(request: Request) {
  const off = await inactive();
  if (off) return off;
  const body = await readJsonBody(request);
  if (!body) return apiError(400, "bad_request", "Requisição inválida.");
  const result = await openGameSessionHandler({
    serverKey: serverKey(request),
    token: String(body.token ?? ""),
    characterId: Number(body.character_id),
  });
  return result.success ? apiOk(result.data) : apiFromError(result.error);
}

/** Grava o estado de vários personagens de uma vez (save periódico e ao sair). */
export async function serverSavePOST(request: Request) {
  const off = await inactive();
  if (off) return off;
  const body = await readJsonBody(request);
  if (!body) return apiError(400, "bad_request", "Requisição inválida.");
  const result = await saveCharactersHandler({ serverKey: serverKey(request), characters: body.characters });
  return result.success ? apiOk(result.data) : apiFromError(result.error);
}

/** Batimento: quem está online e o endereço público do servidor de jogo. */
export async function serverHeartbeatPOST(request: Request) {
  const off = await inactive();
  if (off) return off;
  const body = await readJsonBody(request);
  if (!body) return apiError(400, "bad_request", "Requisição inválida.");
  const result = await recordHeartbeatHandler({ serverKey: serverKey(request), heartbeat: body });
  return result.success ? apiOk({}) : apiFromError(result.error);
}
