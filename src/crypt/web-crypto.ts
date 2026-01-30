/**
 * Provides support for using the WebCrypto API for with the Crypt module.
 *
 * @module Crypt/WebCrypto
 * @experimental
 */

import type { Instance, InstanceConfig } from '../instance/instance.js';
import { assembleCryptoInstanceConfig } from './assemble-instance-config.js';
import { prepareKeyDerivationInput } from './kdf.js';
import type { CryptOptions } from './options.js';
import type { CryptFnContext, CryptModule } from './types.js';

export const WebCryptoSupportedCryptAlgs = [
  // 'AES-CBC', // TODO(feat): add support: algorithm.iv must contain exactly 16 bytes
  // 'AES-CTR', // TODO(feat): add support: 'counter' is required in 'AesCtrParams'
  'AES-GCM',
  // 'RSA-OAEP', // TODO(feat): add support: 'hash' is required in 'RsaHashedImportParams'
] as const;

export type WebCryptoSupportedCryptAlg = (typeof WebCryptoSupportedCryptAlgs)[number];

async function crypt(this: 'decrypt' | 'encrypt', { encAlg, key, nonce, payload }: CryptFnContext) {
  return new Uint8Array(await crypto.subtle[this]({ name: encAlg, iv: nonce }, key, payload));
}

/**
 * Derives a symmetric encryption key using the given options. Requires a key derivation input to be
 * provided - one of {@link CryptOptions.passphrase} or {@link CryptOptions.pubKey}. If `pubkey` is
 * provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation fails.
 *
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @param options The key derivation options.
 * @returns The derived `CryptoKey` as a promise.
 */
export const deriveWebCryptoKey = async (
  instance: Instance,
  options: Omit<CryptOptions, 'nonce'>,
) =>
  crypto.subtle.deriveKey(
    {
      name: options.kdf,
      hash: options.hashAlg,
      iterations: options.iterations,
      salt: options.salt,
    },
    await crypto.subtle.importKey(
      'raw',
      prepareKeyDerivationInput(instance, options),
      options.kdf,
      false,
      ['deriveKey'],
    ),
    { name: options.encAlg, length: 256 },
    true,
    ['decrypt', 'encrypt'],
  );

/**
 * An {@link CryptModule} that implements encryption using the WebCrypto API for supported
 * algorithms.
 */
export const WebCrypto: CryptModule = {
  decrypt: crypt.bind('decrypt'),
  encrypt: crypt.bind('encrypt'),
};

/**
 * An {@link InstanceConfig} that provides `cryptAlgs` for algorithms supported by the the WebCrypto
 * API.
 */
export const WithWebCrypto: InstanceConfig = assembleCryptoInstanceConfig(
  WebCrypto,
  WebCryptoSupportedCryptAlgs,
);
