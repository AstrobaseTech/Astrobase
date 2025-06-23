import { describe, expect, test } from 'vitest';
import { sha256, SHA_256 } from '../hashing/index.js';
import { createInstance } from '../instance/instance.js';
import { entropyToMnemonic, mnemonicToEntropy, mnemonicToSeed, validateWordlist } from './bip39.js';
import VECTORS from './testing/vectors.json' with { type: 'json' };
import WORDLIST from './wordlist/en.js';

const instance = createInstance({
  hashAlgs: {
    [SHA_256]: sha256,
  },
});

const mappedVectors = VECTORS.map(([entropyHex, mnemonic, seedHex], i) => ({
  testName: `Vector ${i + 1} (${mnemonic.slice(0, 30)}...)`,
  entropy: hexToBytes(entropyHex),
  mnemonic,
  words: mnemonic.split(' '),
  seed: hexToBytes(seedHex),
}));

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

test('validateWordlist', () => {
  for (const wordlist of [[], WORDLIST.slice(0, Math.ceil(Math.random() * 2047))])
    expect(() => validateWordlist(wordlist)).toThrow(RangeError('Wordlist length != 2048'));
});

describe('entropyToMnemonic', () => {
  for (const { testName, entropy, words } of mappedVectors) {
    test(testName, async () =>
      expect(await entropyToMnemonic(instance, entropy, WORDLIST)).toEqual(words),
    );
  }

  describe('Catch invalid entropy lengths', () => {
    const entropy = VECTORS[0][0] + VECTORS[0][0];
    const error = TypeError('Invalid entropy length');

    for (let i = 0; i < 33; i++) {
      if (i < 16 || i > 32 || i % 4 != 0) {
        test(`Length ${i}`, async () => {
          const truncatedEntropy = hexToBytes(entropy.slice(0, i));
          await expect(entropyToMnemonic(instance, truncatedEntropy, WORDLIST)).rejects.toThrow(
            error,
          );
        });
      }
    }
  });
});

describe('mnemonicToEntropy', () => {
  describe('mnemonic string', () => {
    for (const { testName, entropy, mnemonic } of mappedVectors) {
      test(testName, async () => {
        expect(new Uint8Array(await mnemonicToEntropy(instance, mnemonic, WORDLIST))).toEqual(
          entropy,
        );
      });
    }
  });

  describe('mnemonic array', () => {
    for (const { testName, entropy, words } of mappedVectors) {
      test(testName, async () => {
        expect(new Uint8Array(await mnemonicToEntropy(instance, words, WORDLIST))).toEqual(entropy);
      });
    }
  });

  describe('Catch invalid mnemonic lengths', () => {
    const mnemonic = (VECTORS[0][1] + ' ' + VECTORS[0][1] + ' ' + VECTORS[0][1]).split(' ');
    const error = TypeError('Invalid mnemonic length');

    for (let i = 0; i < 33; i++) {
      if (i < 12 || i > 24 || i % 3 != 0) {
        test(`Length ${i}`, async () => {
          const truncatedMnemonic = mnemonic.slice(0, i);
          await expect(mnemonicToEntropy(instance, truncatedMnemonic, WORDLIST)).rejects.toThrow(
            error,
          );
          await expect(
            mnemonicToEntropy(instance, truncatedMnemonic.join(' '), WORDLIST),
          ).rejects.toThrow(error);
        });
      }
    }
  });

  test('Catch non-wordlist words', async () => {
    const mnemonic = Array.from({ length: 12 }, () => 'notaword');
    const error = TypeError('Mnemonic word not in wordlist');
    await expect(mnemonicToEntropy(instance, mnemonic, WORDLIST)).rejects.toThrow(error);
    await expect(mnemonicToEntropy(instance, mnemonic.join(' '), WORDLIST)).rejects.toThrow(error);
  });

  test('Catch invalid checksum', async () => {
    const [{ words }] = mappedVectors;
    const badMnemonic = words.slice(0, -1);
    badMnemonic.push('bacon');
    const error = Error('Invalid checksum');
    await expect(mnemonicToEntropy(instance, badMnemonic, WORDLIST)).rejects.toThrow(error);
    await expect(mnemonicToEntropy(instance, badMnemonic.join(' '), WORDLIST)).rejects.toThrow(
      error,
    );
  });
});

describe('mnemonicToSeed', () => {
  describe('mnemonic string', () => {
    for (const { testName, mnemonic, seed } of mappedVectors) {
      test(testName, async () => {
        expect(new Uint8Array(await mnemonicToSeed(mnemonic, 'TREZOR'))).toEqual(seed);
      });
    }
  });

  describe('mnemonic array', () => {
    for (const { testName, words, seed } of mappedVectors) {
      test(testName, async () => {
        expect(new Uint8Array(await mnemonicToSeed(words, 'TREZOR'))).toEqual(seed);
      });
    }
  });
});
