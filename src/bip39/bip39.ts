/** @module BIP39 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { SHA_256 } from '../hashing/algorithms/sha256.js';
import { getOrThrow, type Instance } from '../instance/instance.js';

const deriveChecksum = async (instance: Instance, entropy: Uint8Array<ArrayBuffer>) =>
  toBinaryString(new Uint8Array(await getOrThrow(instance, 'hashAlgs', SHA_256)(entropy))).slice(
    0,
    entropy.length / 4,
  );

const toBinaryString = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(2).padStart(8, '0')).join('');

/**
 * Validates, trims words, and normalizes unicode into NFKD.
 *
 * @param mnemonic The 12, 15, 18, 21 or 24 word mnemonic as an array or sentence string.
 * @returns The normalized mnemonic as an array of words.
 * @throws If mnemonic length is invalid length.
 */
export function normalizeMnemonic(mnemonic: string[] | string) {
  mnemonic = typeof mnemonic === 'string' ? mnemonic.split(' ') : mnemonic;
  if (mnemonic.length < 12 || mnemonic.length > 24 || mnemonic.length % 3 != 0) {
    throw TypeError('Invalid mnemonic length');
  }
  return mnemonic.map((word) => word.normalize('NFKD').trim());
}

/**
 * @param wordlist The 2048 word wordlist.
 * @throws If wordlist length != 2048.
 */
export function validateWordlist(wordlist: string[]) {
  if (wordlist.length != 2048) {
    throw new RangeError('Wordlist length != 2048');
  }
}

/**
 * Derives a mnemonic encoding from the entropy using the wordlist.
 *
 * @param instance An instance with a SHA-256 implementation provided to derive checksums.
 * @param entropy Valid values are 128, 160, 192, 224, or 256 bits in length. Greater entropy
 *   lengths result in greater security but greater sentence length.
 * @param wordlist The 2048 word wordlist to use.
 * @returns A 12 to 24 word mnemonic.
 * @throws If entropy has invalid length.
 */
export async function entropyToMnemonic(
  instance: Instance,
  entropy: Uint8Array<ArrayBuffer>,
  wordlist: string[],
) {
  validateWordlist(wordlist);
  if (entropy.length < 16 || entropy.length > 32 || entropy.length % 4 != 0) {
    throw TypeError('Invalid entropy length');
  }
  return (toBinaryString(entropy) + (await deriveChecksum(instance, entropy)))
    .match(/(.{1,11})/g)!
    .map((chunk) => wordlist[parseInt(chunk, 2)]);
}

/**
 * Decodes the mnemonic back into the original entropy using the wordlist.
 *
 * @param instance An instance with a SHA-256 implementation provided to derive checksums.
 * @param mnemonic The 12, 15, 18, 21 or 24 word mnemonic as an array or sentence string.
 * @param wordlist The 2048 word wordlist to use.
 * @returns The entropy encoded in the mnemonic.
 * @throws If mnemonic or wordlist is invalid.
 */
export async function mnemonicToEntropy(
  instance: Instance,
  mnemonic: string[] | string,
  wordlist: string[],
) {
  validateWordlist(wordlist);
  const bits = normalizeMnemonic(mnemonic)
    .map((word) => {
      const index = wordlist.indexOf(word);
      if (index == -1) {
        throw new TypeError('Mnemonic word not in wordlist');
      }
      return index.toString(2).padStart(11, '0');
    })
    .join('');
  const entropyLength = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, entropyLength);
  const entropyBytes = new Uint8Array(entropyBits.match(/(.{1,8})/g)!.map((b) => parseInt(b, 2)));
  if (bits.slice(entropyLength) !== (await deriveChecksum(instance, entropyBytes))) {
    throw new Error('Invalid checksum');
  }
  return entropyBytes;
}

/**
 * Derives a seed from the mnemonic and optional passphrase. The mnemonic is assumed to have a
 * correct checksum.
 *
 * @param mnemonic The 12, 15, 18, 21 or 24 word mnemonic as an array or sentence string.
 * @param passphrase The optional passphrase.
 * @returns The seed.
 * @throws If mnemonic is invalid.
 */
export async function mnemonicToSeed(
  mnemonic: string[] | string,
  passphrase = '',
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(normalizeMnemonic(mnemonic).join(' '));
  const salt = encoder.encode(`mnemonic${passphrase}`);
  const key = await crypto.subtle.importKey('raw', keyMaterial, 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      iterations: 2048,
      salt: salt,
    },
    key,
    512,
  );
}
