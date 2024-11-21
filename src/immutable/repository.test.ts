import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { File } from '../file/file.js';
import { hash, Hash, HashAlgorithm } from '../hashes/index.js';
import { ContentIdentifier } from '../identifiers/identifiers.js';
import { clients, type RPCClientConfig } from '../rpc/client/index.js';
import type { ContentProcedures } from '../rpc/shared/index.js';
import { deleteImmutable, getImmutable, putImmutable, toImmutableCID } from './repository.js';

const instanceID = 'Immutable';

describe(instanceID, () => {
  describe('Delete', () => {
    const deleteHandler = vi.fn();
    const client: RPCClientConfig<Pick<ContentProcedures, 'content:delete'>> = {
      instanceID,
      strategy: { procedures: { 'content:delete': deleteHandler } },
    };

    beforeAll(() => clients.add(client));
    afterAll(() => clients.delete(client));

    const hash = new Hash([HashAlgorithm.SHA256, ...crypto.getRandomValues(new Uint8Array(32))]);
    const cid = toImmutableCID(hash);

    (
      [
        ['array', [...hash.bytes]],
        ['base58 string', hash.toBase58()],
        ['Hash', hash],
        ['Uint8Array', hash.bytes],
      ] as const
    ).forEach(([name, cidLike], i) =>
      test(`With ${name}`, async () => {
        await expect(deleteImmutable(cidLike, instanceID)).resolves.toBeUndefined();
        expect(deleteHandler).toBeCalledTimes(i + 1);
        expect(deleteHandler).lastCalledWith(cid, instanceID);
      }),
    );
  });

  describe('Get', async () => {
    const file = await new File().setMediaType('application/json').setValue({ test: 'test' });
    const fileHash = await hash(HashAlgorithm.SHA256, file.buffer);
    const fileCID = toImmutableCID(fileHash);

    const invalidCIDs = [
      crypto.getRandomValues(new Uint8Array(33)),
      [HashAlgorithm.SHA256, ...crypto.getRandomValues(new Uint8Array(32))],
    ].map((arr) => toImmutableCID(arr));

    const getHandler = vi.fn((inputCID: ContentIdentifier) => {
      for (const knownCID of [fileCID, ...invalidCIDs]) {
        if (inputCID.toBase58() === knownCID.toBase58()) {
          return Promise.resolve(file.buffer);
        }
      }
      return Promise.resolve();
    });

    const client: RPCClientConfig<Pick<ContentProcedures, 'content:get'>> = {
      instanceID,
      strategy: { procedures: { 'content:get': getHandler } },
    };

    beforeAll(() => clients.add(client));
    afterAll(() => clients.delete(client));

    let i = 0;

    test('Found and valid', async () => {
      await expect(getImmutable<unknown>(fileHash, instanceID)).resolves.toEqual(file);
      expect(getHandler).toBeCalledTimes(++i);
      expect(getHandler).lastCalledWith(fileCID, instanceID);
      expect(getHandler).lastReturnedWith(Promise.resolve(file.buffer));
    });

    test('Found but invalid', async () => {
      for (const cid of invalidCIDs) {
        await expect(getImmutable<unknown>(cid.rawValue, instanceID)).resolves.toBeUndefined();
        expect(getHandler).toBeCalledTimes(++i);
        expect(getHandler).lastCalledWith(cid, instanceID);
        expect(getHandler).lastReturnedWith(Promise.resolve(file.buffer));
      }
    });

    test('Not found', async () => {
      const cid = toImmutableCID([
        HashAlgorithm.SHA256,
        ...crypto.getRandomValues(new Uint8Array(32)),
      ]);
      await expect(getImmutable<unknown>(cid.rawValue, instanceID)).resolves.toBeUndefined();
      expect(getHandler).toBeCalledTimes(++i);
      expect(getHandler).lastCalledWith(cid, instanceID);
      expect(getHandler).lastReturnedWith(Promise.resolve());
    });
  });

  describe('Put', () => {
    const putHandler = vi.fn();
    const client: RPCClientConfig<Pick<ContentProcedures, 'content:put'>> = {
      instanceID,
      strategy: { procedures: { 'content:put': putHandler } },
    };

    beforeAll(() => clients.add(client));
    afterAll(() => clients.delete(client));

    test('With File', async () => {
      const file = await new File().setMediaType('application/json').setValue({ test: 'test' });
      const cid = await putImmutable(file, { instanceID });
      expect(cid).toBeInstanceOf(ContentIdentifier);
      expect(putHandler).toBeCalledTimes(1);
      expect(putHandler).lastCalledWith({ cid, content: file.buffer }, instanceID);
    });
  });
});
