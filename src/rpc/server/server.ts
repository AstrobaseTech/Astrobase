import { Registry, type MaybePromise, type RegistryModule } from '../../internal/index.js';
import { getIdentity } from '../../keyrings/server/identity.js';
import {
  clearKeyring,
  createKeyring,
  importKeyring,
  loadKeyring,
} from '../../keyrings/server/keyring.js';
import { unwrap, wrap } from '../../wraps/wraps.js';
import type { RequestMessage, ResponseMessage } from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestHandler<Req = any, Res = any> = (
  request: Req,
  instanceID?: string,
) => MaybePromise<Res>;

export interface HandlerRegistryModule extends RegistryModule<string> {
  handler: RequestHandler;
}

/**
 * This {@linkcode Registry} allows registration and overriding of RPC request handlers by request
 * type.
 */
export const HandlerRegistry = new Registry<string, HandlerRegistryModule>({
  defaults: {
    'identity.get': { handler: getIdentity },
    'keyring.clear': { handler: (_, instanceID) => clearKeyring(instanceID) },
    'keyring.create': { handler: createKeyring },
    'keyring.import': { handler: importKeyring },
    'keyring.load': { handler: loadKeyring },
    unwrap: { handler: unwrap },
    wrap: { handler: wrap },
  },
  validateKey: (k) => typeof k === 'string',
  validateModule: (m) => typeof m.handler === 'function',
});

function createError(request: RequestMessage, error?: string): ResponseMessage {
  const { instanceID, jobID, op } = request;
  return {
    error,
    instanceID,
    jobID,
    ok: false,
    op,
  };
}

export async function processRequest(request: RequestMessage): Promise<ResponseMessage> {
  const { handler } = HandlerRegistry.getStrict(request.op);
  try {
    // eslint-disable-next-line
    var payload = await Promise.resolve(handler(request.payload, request.instanceID));
  } catch (e) {
    return createError(request, e instanceof Error ? e.message : undefined);
  }
  const { instanceID, jobID, op } = request;
  return {
    instanceID,
    jobID,
    ok: true,
    op,
    payload,
  };
}
