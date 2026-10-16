import type { OperationResult } from "@venore/plugin-sdk";
import { getServerConfig } from "../config/service";
import { getLatestVersionNumber } from "../content/service";
import { getGameServerStatus } from "../server/service";

export type PublicStatus = {
  server: { name: string; motd: string; online: boolean };
  client: { min_version: string; latest_version: string; download_url: string };
  content: { version: string | null; url: string };
  game_server: { url: string; online: boolean; players_online: number };
};

/** Público: primeira chamada do app ao abrir (docs/server-api.md no repo do jogo). */
export async function getPublicStatusHandler(): Promise<OperationResult<PublicStatus>> {
  const [config, version, game] = await Promise.all([getServerConfig(), getLatestVersionNumber(), getGameServerStatus()]);
  if (!config.success) return config;
  if (!game.success) return game;
  const c = config.data;
  // endereço fixo do admin tem prioridade; vazio = o que o servidor de jogo anunciou no batimento
  const url = c.gameServerUrl !== "" ? c.gameServerUrl : (game.data.publicUrl ?? "");
  return {
    success: true,
    data: {
      server: { name: c.serverName, motd: c.motd, online: true },
      client: { min_version: c.minClientVersion, latest_version: c.latestClientVersion, download_url: c.downloadUrl },
      content: { version: version === null ? null : String(version), url: "/api/rpg/content" },
      // online = o servidor de jogo mandou batimento há pouco (não basta ter endereço cadastrado)
      game_server: { url, online: url !== "" && game.data.online, players_online: game.data.players.length },
    },
  };
}
