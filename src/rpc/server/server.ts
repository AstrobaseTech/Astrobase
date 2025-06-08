/**
 * @module RPC/Server
 * @experimental
 */

import { getOrThrow, type Instance } from '../../instance/instance.js';
import type { MaybePromise } from '../../internal/index.js';
import type { RequestMessage, ResponseMessage } from '../shared/index.js';

/**
 * A handler function for a procedure.
 *
 * Request handler functions deal only with the request data. The rest is handled by the SDK.
 *
 * @template Req The type of the request payload.
 * @template Res The type of the response payload.
 * @param request The request payload.
 * @param instance The {@link Instance} config.
 * @returns The response payload.
 */
export type ProcedureExecutor<Req, Res> = (request: Req, instance: Instance) => MaybePromise<Res>;

/**
 * Processes an RPC {@link RequestMessage} using registered handlers and returns a
 * {@link ResponseMessage}.
 *
 * @param request An RPC {@link RequestMessage} from a client.
 * @returns The RPC {@link ResponseMessage} to return to the client.
 */
export async function processRequest(
  instance: Instance,
  request: RequestMessage<string, unknown>,
): Promise<ResponseMessage<string, unknown>> {
  const { jobID, procedure } = request;
  try {
    const executor = getOrThrow(instance, 'procedures', procedure);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = await executor(request.payload, instance);
    return { jobID, ok: true, procedure, payload };
  } catch (e) {
    const error = typeof e === 'string' ? e : e instanceof Error ? e.message : undefined;
    return { error, jobID, ok: false, procedure };
  }
}
