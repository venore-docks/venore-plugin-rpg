// Respostas JSON da API pública do app (formato em docs/server-api.md no repo do jogo).
import { NextResponse } from "next/server";

export function apiOk(body: Record<string, unknown>, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json({ ok: true, ...body }, { status: init?.status ?? 200, headers: { "Cache-Control": "no-store", ...init?.headers } });
}

export function apiError(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status, headers: { "Cache-Control": "no-store" } });
}

const ERROR_STATUS: Record<string, number> = {
  "rpg.invalid_credentials": 401,
  "rpg.invalid_session": 401,
  "rpg.banned": 403,
  "rpg.client_outdated": 426,
  "rpg.name_taken": 409,
  "rpg.not_found": 404,
  "rpg.invalid_server_key": 401,
  "rpg.too_many_characters": 409,
};

/** Converte um erro de service (code namespaced) em resposta HTTP. */
export function apiFromError(err: { code: string; message: string }) {
  const short = err.code.startsWith("rpg.") ? err.code.slice(4) : err.code;
  return apiError(ERROR_STATUS[err.code] ?? 400, short, err.message);
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}
