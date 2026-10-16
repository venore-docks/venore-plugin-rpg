// Encerra a operação observada (beginOperation) e devolve o OperationResult numa linha só.
// Só servidor (importa a observabilidade do core).
import { endOperation } from "@venore/plugin-sdk/observability";

type Handle = Parameters<typeof endOperation>[0];
type OpError = { code: string; message: string };

export function opFail(handle: Handle, error: OpError): { success: false; error: OpError } {
  endOperation(handle, { success: false, error });
  return { success: false, error };
}

export function opOk<T>(handle: Handle, data: T): { success: true; data: T } {
  endOperation(handle, { success: true });
  return { success: true, data };
}
