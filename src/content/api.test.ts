import { describe, expect, test, vi } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { inMemory } from '../in-memory/in-memory-client.js';
import { createInstance } from '../instance/instance.js';
import { deleteContent, putContent } from './api.js';

test('deleteContent', async () => {
  const clientA = inMemory();
  const clientB = inMemory();

  const fnA = (clientA['content:delete'] = vi.fn(clientA['content:delete']));
  const fnB = (clientB['content:delete'] = vi.fn(clientB['content:delete']));

  const cid = new ContentIdentifier('test', []);

  const instance = createInstance({
    clients: [{ strategy: clientA }, { strategy: clientB }],
  });

  await expect(deleteContent(cid, instance)).resolves.toBeUndefined();

  expect(fnA).toHaveBeenCalledExactlyOnceWith(cid, instance);
  expect(fnB).toHaveBeenCalledExactlyOnceWith(cid, instance);
});

describe.todo('getContent');

describe('putContent', () => {
  test('With validate disabled', async () => {
    const clientA = inMemory();
    const clientB = inMemory();

    const fnA = (clientA['content:put'] = vi.fn(clientA['content:put']));
    const fnB = (clientB['content:put'] = vi.fn(clientB['content:put']));

    const cid = new ContentIdentifier('test', []);

    const instance = createInstance({
      clients: [{ strategy: clientA }, { strategy: clientB }],
    });

    await expect(putContent(cid, '', { instance, validate: false })).resolves.toBeUndefined();

    expect(fnA).toHaveBeenCalledExactlyOnceWith({ cid, content: new Uint8Array([]) }, instance);
    expect(fnB).toHaveBeenCalledExactlyOnceWith({ cid, content: new Uint8Array([]) }, instance);
  });

  test.todo('With validate enabled');
});
