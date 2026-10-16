import type { OperationResult } from "@venore/plugin-sdk";
import { getServerConfig } from "../config/service";
import { getLatestVersionNumber } from "../content/service";

export type PublicStatus = {
  server: { name: string; motd: string; online: boolean };
  client: { min_version: string; latest_version: string; download_url: string };
  content: { version: string | null; url: string };
  game_server: { url: string; online: boolean };
};

/** Público: primeira chamada do app ao abrir (docs/server-api.md no repo do jogo). */
export async function getPublicStatusHandler(): Promise<OperationResult<PublicStatus>> {
  const [config, version] = await Promise.all([getServerConfig(), getLatestVersionNumber()]);
  if (!config.success) return config;
  const c = config.data;
  return {
    success: true,
    data: {
      server: { name: c.serverName, motd: c.motd, online: true },
      client: { min_version: c.minClientVersion, latest_version: c.latestClientVersion, download_url: c.downloadUrl },
      content: { version: version === null ? null : String(version), url: "/api/rpg/content" },
      game_server: { url: c.gameServerUrl, online: c.gameServerUrl !== "" },
    },
  };
}
