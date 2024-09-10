import { describe, expect, test } from 'vitest';
import { mockJSONCodec } from '../../test/util/codecs.js';
import { getChannels, type Channel } from '../channels/index.js';
import { CodecRegistry } from '../codec/codecs.js';
import { File } from '../file/file.js';
import { ContentIdentifier, IdentifierRegistry } from '../identifiers/identifiers.js';
import { deleteImmutable, getImmutable, putImmutable } from './operations.js';
import { Hash, HashAlgorithm } from './hashes.js';
import { Immutable } from './schema.js';

const instanceID = 'Immutable Operations';
const mockDriverA: Channel = {};
const mockDriverB: Channel = {};
const channels = getChannels(instanceID);

channels.push(mockDriverA, mockDriverB);
CodecRegistry.register(mockJSONCodec, { instanceID });
IdentifierRegistry.register(Immutable, { instanceID });

function createHash() {
  return crypto.getRandomValues(new Uint8Array(33));
}

describe('Delete immutable', () => {
  const baseHash = new Hash([HashAlgorithm.SHA256, ...createHash()]);
  const testCases = [
    ['Uint8Array', baseHash.bytes],
    ['Hash', baseHash],
  ] as const;
  for (const [paramType, requestHash] of testCases) {
    test('With ' + paramType, async () => {
      let calls = 0;
      function deleteMock(id: ContentIdentifier) {
        calls++;
        expect(id.rawValue).toEqual(baseHash.bytes);
      }
      mockDriverA.delete = deleteMock;
      mockDriverB.delete = deleteMock;
      await expect(deleteImmutable(requestHash, instanceID)).resolves.toBeUndefined();
      expect(calls).toBe(2);
    });
  }
});

test('Get immutable', async () => {
  const instanceID = 'Get File';

  const existing = crypto.getRandomValues(new Uint8Array(16));
  const existingCID = new Uint8Array([Immutable.key, ...existing]);

  getChannels(instanceID).push({
    get(id) {
      if (id.bytes.length !== existingCID.length) {
        return;
      }
      for (let i = 0; i < id.bytes.length; i++) {
        if (id.bytes[i] !== existingCID[i]) {
          return;
        }
      }
      return id.bytes;
    },
  });

  IdentifierRegistry.register({ key: Immutable.key, parse: (_, v) => v }, { instanceID });

  for (const cid of [existing, new Hash(existing)]) {
    await expect(getImmutable(cid, instanceID)).resolves.toEqual(existingCID);
  }

  const nonExistent = crypto.getRandomValues(new Uint8Array(16));
  for (const cid of [nonExistent, new Hash(nonExistent)]) {
    await expect(getImmutable(cid, instanceID)).resolves.toBeUndefined();
  }
});

test('Put immutable', async () => {
  const mediaType = 'application/json';
  const value = { test: 'test' };
  const file = await new File().setMediaType(mediaType).setValue(value);
  let calls = 0;
  function putMock(id: ContentIdentifier, object: Uint8Array) {
    calls++;
    expect(id.rawValue).toBeInstanceOf(Uint8Array);
    expect(object).toBeInstanceOf(Uint8Array);
  }
  mockDriverA.put = putMock;
  mockDriverB.put = putMock;
  await expect(putImmutable(file, { instanceID })).resolves.toBeInstanceOf(ContentIdentifier);
  expect(calls).toBe(2);
});
