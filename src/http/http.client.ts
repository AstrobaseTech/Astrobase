import { decodeWithCodec, encodeWithCodec } from '../codec/codecs.js';
import type { RPCClientStrategy } from '../rpc/client/types.js';
import type { ResponseMessage } from '../rpc/shared/messages.js';

interface HttpClientOptions {
  apiURL: string;
}

export default (options: HttpClientOptions) =>
  ({
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
  }) satisfies RPCClientStrategy;
