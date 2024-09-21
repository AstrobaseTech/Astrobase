/** @module RPC/Server */

import type { MaybePromise } from '../internal/index.js';
import { Registry } from '../registry/registry.js';
import type { RequestMessage, ResponseMessage } from './shared/index.js';

/**
 * A handler function for RPC requests.
 *
 * Request handler functions deal only with the payload. The rest of the request and response
 * messages is handled by the SDK.
 *
 * @template Req The type of the request payload.
 * @template Res The type of the response payload.
 * @param request The request payload.
 * @param instanceID The requested instance.
 * @returns The response payload.
 */
export type RequestHandler<Req, Res> = (request: Req, instanceID?: string) => MaybePromise<Res>;

/** The {@linkcode Registry} for registration of RPC request handlers by procedure type. */
export const HandlerRegistry = new Registry<string, RequestHandler<unknown, unknown>>({
  validateKey: (key) => typeof key === 'string',
  validateStrategy: (strategy) => typeof strategy === 'function',
});

/**
 * Processes an RPC {@linkcode RequestMessage} using registered handlers and returns a
 * {@linkcode ResponseMessage}.
 *
 * @param request An RPC {@linkcode RequestMessage} from a client.
 * @returns The RPC {@linkcode ResponseMessage} to return to the client.
 */
export async function processRequest(
  request: RequestMessage<string, unknown>,
): Promise<ResponseMessage<string, unknown>> {
  const instanceID = request.instanceID;
  const jobID = request.jobID;
  const op = request.procedure;
  try {
    const handler = HandlerRegistry.getStrict(request.procedure, request.instanceID);
    const payload = await Promise.resolve(handler(request.payload, request.instanceID));
    return { instanceID, jobID, ok: true, procedure: op, payload };
  } catch (e) {
    const error = e instanceof Error ? e.message : undefined;
    return { error, instanceID, jobID, ok: false, procedure: op };
  }
}
