/**
 * @module HTTP/Client
 *
 * @experimental
 */

import { decodeWithCodec, encodeWithCodec } from '../codecs/codecs.js';
import type { ClientStrategy } from '../rpc/client/client-strategy.js';
import type { ResponseMessage } from '../rpc/shared/messages.js';

/**
 * Creates an {@link ClientStrategy} for a HTTP API.
 *
 * @param apiURL The full URL of the target HTTP API, e.g. `http://localhost:3000/astrobase`.
 */
export default (apiURL: string): ClientStrategy<object> => ({
  async '*'(procedure, payload, instance) {
    const response = await fetch(`${apiURL}/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: await encodeWithCodec(instance, payload, 'application/json'),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result = (await decodeWithCodec(
      instance,
      new Uint8Array(await response.arrayBuffer()),
      'application/json',
    )) as ResponseMessage<string, unknown>;
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.payload;
  },
});
