import { describe, expect, test } from 'vitest';
import WORDLIST from '../../bip39-wordlist-english.json';
import { Hash } from '../immutable/hashes.js';
import * as K from '../keyrings/index.js';

describe('Keyring E2E', { sequential: true }, () => {
  const passphrase = '1234';

  let createResult: K.CreateKeyringResult;

  test('Create keyring', async () => {
    createResult = await K.createKeyring({ wordlist: WORDLIST, passphrase });

    // Must return a hash we can use to retrieve encrypted serialized keyring later
    expect(createResult.cid).toBeInstanceOf(Hash);

    // Must return a mnemonic we can use to recover the seed
    const mnemonicWords = createResult.mnemonic.split(' ');
    expect(mnemonicWords.length).toBe(12);
    for (const word of mnemonicWords) {
      expect(WORDLIST).toContain(word);
    }
  });

  test('Import keyring', async () => {
    const importResult = await K.importKeyring({
      wordlist: WORDLIST,
      mnemonic: createResult.mnemonic,
      passphrase,
    });

    expect(importResult).toBeInstanceOf(Hash);
  });
});
