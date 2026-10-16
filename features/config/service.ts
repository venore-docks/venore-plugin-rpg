import type { OperationResult } from "@venore/plugin-sdk";
import { beginOperation } from "@venore/plugin-sdk/observability";
import { mergeServerConfig } from "../../shared/config";
import { opOk } from "../../shared/operation";
import { selectConfigRows, upsertConfigRows } from "./store";
import type { ServerConfig } from "../../contracts/types";

export async function getServerConfig(): Promise<OperationResult<ServerConfig>> {
  return { success: true, data: mergeServerConfig(await selectConfigRows()) };
}

export async function updateServerConfig(command: { config: ServerConfig; actorId: string }): Promise<OperationResult<ServerConfig>> {
  const handle = beginOperation({ useCase: "rpg.update-server-config", actor: { id: command.actorId, type: "user" }, kind: "write" });
  await upsertConfigRows({ ...command.config });
  return opOk(handle, command.config);
}
