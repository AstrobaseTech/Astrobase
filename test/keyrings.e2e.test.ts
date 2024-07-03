import { expect, test } from 'vitest';
import WORDLIST from '../bip39-wordlist-english.json';
import { Hash } from '../src/immutable/hashes.js';
import { createKeyring } from '../src/keyrings/client/index.js';

test('Keyring E2E', async () => {
  const result = await createKeyring({ wordlist: WORDLIST, passphrase: '1234' });
  const mnemonic = result.mnemonic.split(' ');

  // Must return a hash we can use to retrieve encrypted serialized keyring later
  expect(result.id).toBeInstanceOf(Hash);

  // Must return a mnemonic we can use to recover the seed
  expect(mnemonic.length).toBe(12);
  for (const word of mnemonic) {
    expect(WORDLIST).toContain(word);
  }
});
