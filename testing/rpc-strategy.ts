import { assert, expect, test } from 'vitest';
import { ContentIdentifier, type RPCClientStrategy } from '../src/index.js';

export function testRPCStrategyForContent(
  name: string,
  strategy: RPCClientStrategy,
  testAPI = test,
) {
  testAPI(`${name} RPC strategy`, async () => {
    const { procedures } = strategy;

    assert(!!procedures, 'Strategy has no procedures');

    const content = new TextEncoder().encode('test');
    const cid = new ContentIdentifier(content);

    await expect(Promise.resolve(procedures['content:get'](cid))).resolves.toBeUndefined();
    await expect(
      Promise.resolve(procedures['content:put']({ cid, content })),
    ).resolves.toBeUndefined();
    await expect(Promise.resolve(procedures['content:get'](cid))).resolves.toEqual(content);
    await expect(Promise.resolve(procedures['content:delete'](cid))).resolves.toBeUndefined();
    await expect(Promise.resolve(procedures['content:get'](cid))).resolves.toBeUndefined();
  });
}
