/** @module In-Memory */

import type { ContentProcedures } from '../content/procedures.js';
import type { ClientStrategy } from '../rpc/client/client-strategy.js';

/** Creates a simple in-memory RPC Client for content procedures. Useful for testing or caching. */
export function inMemory(): ClientStrategy<ContentProcedures> {
  const content = new Map<string, Uint8Array>();
  return {
    'content:delete'(cid) {
      content.delete(cid.toString());
    },
    'content:get': (cid) => content.get(cid.toString()),
    'content:put'(payload) {
      content.set(payload.cid.toString(), payload.content);
    },
  };
}
