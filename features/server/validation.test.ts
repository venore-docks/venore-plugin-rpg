import { describe, expect, it } from "vitest";
import { MAX_SAVES_PER_CALL, validateHeartbeat, validateSaves } from "./validation";

describe("validateSaves", () => {
  it("aceita lista de personagens com save objeto", () => {
    const r = validateSaves([{ id: 3, level: 2, save: { v: 5, hp: 10 } }]);
    expect(r).toEqual({ ok: true, value: [{ id: 3, level: 2, save: { v: 5, hp: 10 } }] });
  });

  it("recusa lista vazia, grande demais, id/nível inválidos e save não-objeto", () => {
    expect(validateSaves([]).ok).toBe(false);
    expect(validateSaves(Array.from({ length: MAX_SAVES_PER_CALL + 1 }, (_, i) => ({ id: i + 1, level: 1, save: {} }))).ok).toBe(false);
    expect(validateSaves([{ id: 0, level: 1, save: {} }]).ok).toBe(false);
    expect(validateSaves([{ id: 1, level: 0, save: {} }]).ok).toBe(false);
    expect(validateSaves([{ id: 1, level: 1, save: [1, 2] }]).ok).toBe(false);
  });
});

describe("validateHeartbeat", () => {
  it("normaliza jogadores e versões", () => {
    const r = validateHeartbeat({ players: ["Ana", 7], server_version: "0.4.0", content_version: "3", public_url: "wss://x.trycloudflare.com" });
    expect(r).toEqual({
      ok: true,
      value: { players: ["Ana", "7"], serverVersion: "0.4.0", contentVersion: "3", publicUrl: "wss://x.trycloudflare.com" },
    });
  });

  it("recusa endereço público que não é websocket", () => {
    expect(validateHeartbeat({ public_url: "http://x.com" }).ok).toBe(false);
    expect(validateHeartbeat({ public_url: "" }).ok).toBe(true);
  });
});
