import { expect, test } from 'vitest';
import { ContentIdentifier, type ContentProcedures, type RPCClientStrategy } from '../src/index.js';

export function testRPCStrategyForContent(
  name: string,
  strategy: RPCClientStrategy<ContentProcedures>,
  testAPI = test,
) {
  testAPI(`${name} RPC strategy`, async () => {
    const { procedures } = strategy;

    const content = new TextEncoder().encode('test');
    const cid = new ContentIdentifier(content);

    await expect(procedures!['content:put']({ cid, content })).resolves.toBeUndefined();
    await expect(procedures!['content:get'](cid)).resolves.toEqual(content);
    await expect(procedures!['content:delete'](cid)).resolves.toBeUndefined();
    await expect(procedures!['content:get'](cid)).resolves.toBeUndefined();
  });
}
