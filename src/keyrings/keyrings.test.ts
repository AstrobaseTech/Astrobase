import { randomBytes } from 'crypto';
import { describe, expect, test } from 'vitest';
import wordlist from '../bip39/wordlist/en.json' with { type: 'json' };
import { ContentIdentifier } from '../cid/cid.js';
import { Common } from '../common/common.js';
import { deleteContent } from '../content/api.js';
import { inMemory } from '../in-memory/in-memory-client.js';
import { createInstance } from '../instance/instance.js';

import {
  activeSeeds,
  clearKeyring,
  createKeyring,
  importKeyring,
  loadKeyring,
  type CreateKeyringRequest,
} from './keyrings.js';

describe('Keyrings', () => {
  test('clearKeyring', () => {
    const instance = createInstance();
    const length = 16;
    const seed = randomBytes(length);

    activeSeeds.set(instance, seed);

    clearKeyring(instance);

    // Bytes should be shredded
    expect(seed.length).toBe(length);
    expect(seed.every((byte) => byte == 0)).toBe(true);

    // Instance active seed should have been cleared
    expect(activeSeeds.get(instance)).toBeUndefined();
  });

  describe('createKeyring', () => {
    const instance = createInstance(Common);
    const passphrase = '1234';

    const testRequest = (testName: string, req: CreateKeyringRequest) =>
      test(testName, async () => {
        const { mnemonic, cid } = await createKeyring(instance, req);

        expect(cid).toBeInstanceOf(ContentIdentifier);

        expect(mnemonic).toBeTypeOf('string');
        const words = mnemonic.split(' ');
        expect(words.length).toBe(12);
        words.forEach((word) => expect(wordlist.includes(word)).toBe(true));
      });

    testRequest('No metadata', { wordlist, passphrase });
    testRequest('With metadata', { wordlist, passphrase, metadata: { arbitraryData: 'abc' } });
  });

  test('E2E', async () => {
    const instance = createInstance(Common, { clients: [{ strategy: inMemory() }] });
    const passphrase = '1234';
    const metadata = { arbitraryData: 'abc' };

    // eslint-disable-next-line prefer-const
    let { cid, mnemonic } = await createKeyring(instance, { wordlist, passphrase, metadata });

    clearKeyring(instance);

    expect(await loadKeyring(instance, { wordlist, cid, passphrase })).toEqual(metadata);

    clearKeyring(instance);

    await deleteContent(cid, instance);

    await expect(loadKeyring(instance, { wordlist, cid, passphrase })).rejects.toThrowError();

    cid = await importKeyring(instance, { wordlist, mnemonic, passphrase, metadata });

    expect(await loadKeyring(instance, { wordlist, cid, passphrase })).toEqual(metadata);
  });
});
