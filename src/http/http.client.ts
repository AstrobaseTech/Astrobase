/** @module HTTP/Client */

import { decodeWithCodec, encodeWithCodec } from '../codec/codecs.js';
import type { RPCClientStrategy } from '../rpc/client/types.js';
import type { ResponseMessage } from '../rpc/shared/messages.js';

/** A HTTP client configuration object. */
export interface HttpClientConfig {
  /**
   * The full URL of the target HTTP API.
   *
   * @example 'http://localhost:3000/astrobase'
   */
  apiURL: string;
}

/**
 * Creates an {@linkcode RPCClientStrategy} for a HTTP API.
 *
 * @param options {@linkcode HttpClientConfig}
 */
export default (options: HttpClientConfig): RPCClientStrategy => ({
  async fallback(procedure, payload, instanceID) {
    const response = await fetch(options.apiURL + '/' + procedure, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await encodeWithCodec(payload, 'application/json', instanceID),
    });
    if (!response.ok) {
      // TODO: better error handling; handle known errors
      throw new Error(response.statusText);
    }
    const result = (await decodeWithCodec(
      new Uint8Array(await response.arrayBuffer()),
      'application/json',
      instanceID,
    )) as ResponseMessage<string, unknown>;
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.payload;
  },
});
