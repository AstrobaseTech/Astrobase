import { randomBytes } from 'crypto';
import { expect, test } from 'vitest';
import { File } from '../file/file.js';
import { ContentIdentifier } from '../identifiers/identifiers.js';
import { clients } from '../rpc/client/client-management.js';
import type { RPCClientConfig } from '../rpc/client/types.js';
import type { ContentProcedures } from '../rpc/shared/procedures.js';
import httpClient from './http.client.js';
import { serve } from './http.server.js';

type Client = RPCClientConfig<ContentProcedures>;

test('HTTP', () =>
  new Promise<void>((res) => {
    const cid = new ContentIdentifier([2, ...randomBytes(8)]);
    const content = new File([1, 0, ...randomBytes(8)]);

    const client = httpClient({ apiURL: 'http://localhost:3000/astrobase' });

    const mock: Client = {
      instanceID: 'http-server',
      strategy: {
        procedures: {
          'content:delete'(payload, instanceID) {
            expect(instanceID).toBe('http-server');
            expect(payload).toEqual(cid);
          },
          'content:get'(payload, instanceID) {
            expect(instanceID).toBe('http-server');
            expect(payload).toEqual(cid);
            return content.buffer;
          },
          'content:put'(payload, instanceID) {
            expect(instanceID).toBe('http-server');
            expect(payload).toEqual({ cid, content: content.buffer });
          },
        },
      },
    };

    clients.add(mock);

    const server = serve({ instanceID: 'http-server' }).on('listening', async () => {
      await expect(client.fallback!('content:delete', cid, 'http-server')).resolves.toBeUndefined();
      await expect(client.fallback!('content:get', cid, 'http-server')).resolves.toEqual(content);
      await expect(
        client.fallback!('content:put', { cid, content: content.buffer }, 'http-server'),
      ).resolves.toBeUndefined();
      clients.delete(mock);
      server.close(() => res());
    });
  }));
