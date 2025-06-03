import type { Instance } from '../../instance/instance.js';
import type { MaybePromise } from '../../internal/index.js';
import type {
  ProcedureName,
  ProcedureTypes,
  ProcedureRequest,
  ProcedureResponse,
} from '../shared/procedures.js';

/**
 * An interface that defines how to call procedures on an RPC target.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 */
export type ClientStrategy<T extends ProcedureTypes> = {
  /**
   * A fallback function that may be used for any procedure kind, even unknown ones. This is invoked
   * for procedure kinds where a procedure has not been defined in the `procedures` map.
   *
   * @param procedure The procedure name.
   * @param request The request data.
   * @param instance The {@link Instance} config.
   * @returns The response payload promise.
   */
  '*'?(procedure: string, request: unknown, instance: Instance): MaybePromise<unknown>;
} & {
  [K in ProcedureName<T>]?: (
    payload: ProcedureRequest<T, K>,
    instance: Instance,
  ) => MaybePromise<ProcedureResponse<T, K>>;
};

/**
 * Calls a procedure.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 * @template P The procedure name string as a type.
 * @param instance The {@link Instance} config to pass to the {@link ClientStrategy}.
 * @param strategy The {@link ClientStrategy} to use to call the procedure.
 * @param procedure The procedure name.
 * @param request The procedure request data.
 * @returns The procedure result data.
 * @throws If the procedure is not supported or if the strategy throws for any reason.
 */
export async function callProcedure<T extends ProcedureTypes, P extends ProcedureName<T>>(
  instance: Instance,
  strategy: ClientStrategy<T>,
  procedure: P,
  request: ProcedureRequest<T, P>,
): Promise<ProcedureResponse<T, P>> {
  if (strategy[procedure]) {
    return await strategy[procedure](request, instance);
  } else if (strategy['*']) {
    return (await strategy['*'](procedure, request, instance)) as ProcedureResponse<T, P>;
  }
  throw new Error(`Strategy does not support procedure '${procedure}'`);
}

/**
 * Checks if a {@link ClientStrategy} supports a procedure.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 * @param strategy The client strategy.
 * @param procedure The procedure name.
 * @returns `true` if the strategy supports the procedure, or `false` otherwise.
 */
export const supportsProcedure = <T extends ProcedureTypes>(
  strategy: ClientStrategy<T>,
  procedure: ProcedureName<T>,
) => !!(strategy[procedure] || strategy['*']);
