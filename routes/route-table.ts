import { asPluginApiHandler, asPluginPage, type PluginRouteTable } from "@venore/plugin-sdk";
import RpgAdminHomePage from "./admin/home-page";
import RpgAccountsPage from "./admin/accounts-page";
import { RpgItemsPage, RpgMonstersPage, RpgNpcsPage } from "./admin/content-page";
import { charactersGET, charactersPOST, contentGET, loginPOST, registerPOST, statusGET } from "./api/app";
import { serverHeartbeatPOST, serverSavePOST, serverSessionPOST } from "./api/server";

// admin → /admin/rpg/<pattern>; api → /api/rpg/<pattern> (consumida pelo app e pelo servidor de
// jogo, sem sessão do site).
export const rpgRouteTable: PluginRouteTable = {
  admin: [
    { pattern: "", Component: asPluginPage(RpgAdminHomePage) },
    { pattern: "items", Component: asPluginPage(RpgItemsPage) },
    { pattern: "monsters", Component: asPluginPage(RpgMonstersPage) },
    { pattern: "npcs", Component: asPluginPage(RpgNpcsPage) },
    { pattern: "accounts", Component: asPluginPage(RpgAccountsPage) },
  ],
  api: [
    { pattern: "status", handlers: { GET: asPluginApiHandler(statusGET) } },
    { pattern: "content", handlers: { GET: asPluginApiHandler(contentGET) } },
    { pattern: "auth/register", handlers: { POST: asPluginApiHandler(registerPOST) } },
    { pattern: "auth/login", handlers: { POST: asPluginApiHandler(loginPOST) } },
    { pattern: "characters", handlers: { GET: asPluginApiHandler(charactersGET), POST: asPluginApiHandler(charactersPOST) } },
    { pattern: "server/session", handlers: { POST: asPluginApiHandler(serverSessionPOST) } },
    { pattern: "server/save", handlers: { POST: asPluginApiHandler(serverSavePOST) } },
    { pattern: "server/heartbeat", handlers: { POST: asPluginApiHandler(serverHeartbeatPOST) } },
  ],
};
