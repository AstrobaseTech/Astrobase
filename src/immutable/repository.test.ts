import { describe, expect, test, vi } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { Common } from '../common/common.js';
import type { ContentProcedures } from '../content/procedures.js';
import { FileBuilder } from '../file/file-builder.js';
import { hash, Hash, SHA_256 } from '../hashing/index.js';
import { createInstance } from '../instance/instance.js';
import type { ClientConfig } from '../rpc/client/client-set.js';
import { deleteImmutable, getImmutable, putImmutable, toImmutableCID } from './repository.js';

describe('Immutable Scheme API', () => {
  describe('Delete', () => {
    const testHandler = vi.fn();

    const testInstance = createInstance(Common, {
      clients: [{ strategy: { 'content:delete': testHandler } }],
    });

    const hash = new Hash([SHA_256, ...crypto.getRandomValues(new Uint8Array(32))]);
    const cid = toImmutableCID(hash);

    (
      [
        ['array', [...hash.bytes]],
        ['Hash', hash],
        ['Uint8Array', hash.bytes],
      ] as const
    ).forEach(([name, cidLike], i) =>
      test(`With ${name}`, async () => {
        await expect(deleteImmutable(testInstance, cidLike)).resolves.toBeUndefined();
        expect(testHandler).toBeCalledTimes(i + 1);
        expect(testHandler).lastCalledWith(cid, testInstance);
      }),
    );
  });

  describe('Get', async () => {
    const testHandler = vi.fn((inputCID: ContentIdentifier) => {
      for (const knownCID of [fileCID, ...invalidCIDs]) {
        if (inputCID.toString() === knownCID.toString()) {
          return Promise.resolve(file.buffer);
        }
      }
      return Promise.resolve();
    });

    const testClient: ClientConfig<Pick<ContentProcedures, 'content:get'>> = {
      strategy: {
        'content:get': testHandler,
      },
    };

    const testInstance = createInstance(Common, { clients: [testClient] });

    const file = await new FileBuilder()
      .setMediaType('application/json')
      .setValue({ test: 'test' }, testInstance);

    const fileHash = await hash(testInstance, SHA_256, file.buffer);

    const fileCID = toImmutableCID(fileHash);

    const invalidCIDs = [
      crypto.getRandomValues(new Uint8Array(33)),
      [SHA_256, ...crypto.getRandomValues(new Uint8Array(32))],
    ].map((arr) => toImmutableCID(arr));

    let i = 0;

    test('Found and valid', async () => {
      await expect(getImmutable<unknown>(testInstance, fileHash)).resolves.toEqual(file);
      expect(testHandler).toBeCalledTimes(++i);
      expect(testHandler).lastCalledWith(fileCID, testInstance);
      expect(testHandler).lastReturnedWith(Promise.resolve(file.buffer));
    });

    test('Found but invalid', async () => {
      for (const cid of invalidCIDs) {
        await expect(getImmutable<unknown>(testInstance, cid.value)).resolves.toBeUndefined();
        expect(testHandler).toBeCalledTimes(++i);
        expect(testHandler).lastCalledWith(cid, testInstance);
        expect(testHandler).lastReturnedWith(Promise.resolve(file.buffer));
      }
    });

    test('Not found', async () => {
      const cid = toImmutableCID([SHA_256, ...crypto.getRandomValues(new Uint8Array(32))]);
      await expect(getImmutable<unknown>(testInstance, cid.value)).resolves.toBeUndefined();
      expect(testHandler).toBeCalledTimes(++i);
      expect(testHandler).lastCalledWith(cid, testInstance);
      expect(testHandler).lastReturnedWith(Promise.resolve());
    });
  });

  test('Put', async () => {
    const testHandler = vi.fn();

    const testInstance = createInstance(Common, {
      clients: [{ strategy: { 'content:put': testHandler } }],
    });

    const file = await new FileBuilder()
      .setMediaType('application/json')
      .setValue({ test: 'test' }, testInstance);

    const cid = await putImmutable(file, { instance: testInstance });

    expect(cid).toBeInstanceOf(ContentIdentifier);

    expect(testHandler).toHaveBeenCalledExactlyOnceWith(
      { cid, content: file.buffer },
      testInstance,
    );
  });
});
