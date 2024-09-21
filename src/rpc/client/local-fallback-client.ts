import { processRequest } from '../server.js';
import type { RPCClientConfig } from './types.js';

/** The default fallback client that attempts to process the request locally. */
export const LocalFallbackClient: RPCClientConfig = {
  strategy: {
    async fallback(op, payload, instanceID) {
      const response = await processRequest({ instanceID, jobID: 0, procedure: op, payload });
      if (response.ok) {
        return response.payload as never;
      } else {
        throw new Error(response.error);
      }
    },
  },
};
