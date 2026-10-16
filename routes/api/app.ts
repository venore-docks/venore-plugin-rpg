// API pública do app (Godot). Contrato em docs/server-api.md no repo do jogo.
// Servida pelo dispatcher do core em /api/rpg/<pattern>. O app não é navegador, então não há CORS.
import { NextResponse } from "next/server";
import { isPluginActive } from "@venore/plugin-sdk";
import { createCharacterHandler, listMyCharactersHandler, loginHandler, registerAccountHandler } from "../../features/accounts/handler";
import { getPublishedContentHandler } from "../../features/content/handler";
import { getPublicStatusHandler } from "../../features/status/handler";
import { apiError, apiFromError, apiOk, bearerToken, readJsonBody } from "../../shared/http";

export async function inactive() {
  return (await isPluginActive("rpg")) ? null : apiError(503, "offline", "Servidor em manutenção.");
}

export async function statusGET() {
  const off = await inactive();
  if (off) return off;
  const result = await getPublicStatusHandler();
  return result.success ? apiOk(result.data) : apiFromError(result.error);
}

export async function contentGET(request: Request) {
  const off = await inactive();
  if (off) return off;
  const result = await getPublishedContentHandler();
  if (!result.success) return apiFromError(result.error);
  if (!result.data) return apiError(404, "no_content", "Nenhuma versão de conteúdo publicada ainda.");
  const etag = `"${result.data.version}"`;
  const headers = { ETag: etag, "Cache-Control": "no-cache" };
  if (request.headers.get("if-none-match") === etag) return new NextResponse(null, { status: 304, headers });
  return NextResponse.json(result.data, { headers });
}

function credentials(body: Record<string, unknown>) {
  return {
    account: String(body.account ?? ""),
    password: String(body.password ?? ""),
    clientVersion: String(body.client_version ?? ""),
  };
}

export async function registerPOST(request: Request) {
  const off = await inactive();
  if (off) return off;
  const body = await readJsonBody(request);
  if (!body) return apiError(400, "bad_request", "Requisição inválida.");
  const result = await registerAccountHandler(credentials(body));
  return result.success ? apiOk({ account_id: result.data.id }, { status: 201 }) : apiFromError(result.error);
}

export async function loginPOST(request: Request) {
  const off = await inactive();
  if (off) return off;
  const body = await readJsonBody(request);
  if (!body) return apiError(400, "bad_request", "Requisição inválida.");
  const result = await loginHandler(credentials(body));
  if (!result.success) return apiFromError(result.error);
  const { token, expiresAt, account, characters } = result.data;
  return apiOk({ token, expires_at: expiresAt.toISOString(), account, characters });
}

export async function charactersPOST(request: Request) {
  const off = await inactive();
  if (off) return off;
  const body = await readJsonBody(request);
  if (!body) return apiError(400, "bad_request", "Requisição inválida.");
  const result = await createCharacterHandler({ token: bearerToken(request), name: String(body.name ?? "") });
  return result.success ? apiOk({ character: result.data }, { status: 201 }) : apiFromError(result.error);
}

export async function charactersGET(request: Request) {
  const off = await inactive();
  if (off) return off;
  const result = await listMyCharactersHandler({ token: bearerToken(request) });
  return result.success ? apiOk(result.data) : apiFromError(result.error);
}
