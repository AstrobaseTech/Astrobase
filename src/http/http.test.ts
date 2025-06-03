import { randomBytes } from 'crypto';
import { expect, test } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { Common } from '../common/common.js';
import type { ContentProcedures } from '../content/procedures.js';
import { FileBuilder } from '../file/file-builder.js';
import { createInstance } from '../instance/instance.js';
import { MUTABLE_PREFIX } from '../mutable/mutable.js';
import type { ClientConfig } from '../rpc/client/client-set.js';
import httpClient from './http.client.js';
import { serve } from './http.server.js';

test('HTTP', () =>
  new Promise<void>((res) => {
    const cid = new ContentIdentifier(MUTABLE_PREFIX, randomBytes(8));
    const content = new FileBuilder().setPayload(randomBytes(8));

    const port = process.env['TEST_HTTP_PORT'] ?? '3000';

    const client = httpClient(`http://localhost:${port}/astrobase`);

    const testClient: ClientConfig<ContentProcedures> = {
      strategy: {
        'content:delete'(payload, inst) {
          expect(inst).toBe(instance);
          expect(payload.toString()).toBe(cid.toString());
        },
        'content:get'(payload, inst) {
          expect(inst).toBe(instance);
          expect(payload.toString()).toBe(cid.toString());
          return content.buffer;
        },
        'content:put'(payload, inst) {
          expect(inst).toBe(instance);
          expect(payload.cid.toString()).toBe(cid.toString());
          expect(payload.content).toEqual(content.buffer);
        },
      },
    };

    const instance = createInstance(Common, { clients: [testClient] });

    const server = serve({
      instance,
      port: parseInt(port),
    }).on('listening', async () => {
      try {
        await expect(client['*']?.('content:delete', cid, instance)).resolves.toBeUndefined();

        await expect(client['*']?.('content:get', cid, instance)).resolves.toEqual(content);

        await expect(
          client['*']?.('content:put', { cid, content: content.buffer }, instance),
        ).resolves.toBeUndefined();

        await expect(client['*']?.('nonexistent-procedure', undefined, instance)).rejects.toThrow(
          Error('Bad Request'),
        );
      } finally {
        server.close(() => res());
      }
    });
  }));
