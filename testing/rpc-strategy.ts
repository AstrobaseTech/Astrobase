import { expect, test } from 'vitest';
import { ContentIdentifier } from '../src/cid/cid.js';
import type { ContentProcedures } from '../src/content/procedures.js';
import { createInstance } from '../src/instance/instance.js';
import type { ClientStrategy } from '../src/rpc/client/client-strategy.js';

export function testRPCStrategyForContent(
  name: string,
  strategy: ClientStrategy<ContentProcedures>,
  instance = createInstance(),
  testAPI = test,
) {
  testAPI(`${name} RPC strategy`, async () => {
    const content = new TextEncoder().encode('test');
    const cid = new ContentIdentifier('test', content);

    await expect(
      Promise.resolve(strategy['content:get']?.(cid, instance)),
    ).resolves.toBeUndefined();

    await expect(
      Promise.resolve(strategy['content:put']?.({ cid, content }, instance)),
    ).resolves.toBeUndefined();

    await expect(Promise.resolve(strategy['content:get']?.(cid, instance))).resolves.toEqual(
      content,
    );

    await expect(
      Promise.resolve(strategy['content:delete']?.(cid, instance)),
    ).resolves.toBeUndefined();

    await expect(
      Promise.resolve(strategy['content:get']?.(cid, instance)),
    ).resolves.toBeUndefined();
  });
}
