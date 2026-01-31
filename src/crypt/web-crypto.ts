/**
 * Provides support for using the WebCrypto API with the Crypt module.
 *
 * @module Crypt/WebCrypto
 * @experimental
 */

import type { InstanceConfig } from '../instance/instance.js';
import type { CryptFnContext, CryptModule } from './types.js';

export const WebCryptoCryptAlgs = [
  'AES-CBC',
  // 'AES-CTR', // TODO(feat): add support: 'counter' is required in 'AesCtrParams'
  'AES-GCM',
  // 'AES-OCB', // TODO(feat): add support: Unable to import AES-OCB using raw format
  // 'ChaCha20-Poly1305', // TODO(feat): add support: Unable to import ChaCha20-Poly1305 using raw format
] as const;

export type WebCryptoCryptAlg = (typeof WebCryptoCryptAlgs)[number];

async function crypt(
  this: 'decrypt' | 'encrypt',
  { encAlg: name, key, nonce: iv, payload }: CryptFnContext,
) {
  return new Uint8Array(
    await crypto.subtle[this](
      { name, iv },
      await crypto.subtle.importKey('raw', key, { name, length: key.length * 8 }, false, [this]),
      payload,
    ),
  );
}

/**
 * An {@link CryptModule} that implements encryption using the WebCrypto API for supported
 * algorithms.
 */
export const WebCryptoCrypt: CryptModule = {
  decrypt: crypt.bind('decrypt'),
  encrypt: crypt.bind('encrypt'),
};

/**
 * An {@link InstanceConfig} that provides `cryptAlgs` for algorithms supported by the the WebCrypto
 * API.
 */
export const WithWebCryptoCrypt: InstanceConfig = {
  cryptAlgs: { 'AES-GCM': WebCryptoCrypt },
};
