/**
 * Provides support for using the WebCrypto API for with the Crypt module.
 *
 * @module Crypt/WebCrypto
 * @experimental
 */

import type { InstanceConfig } from '../instance/instance.js';
import type { CryptFnContext, CryptModule } from './types.js';

async function crypt(this: 'decrypt' | 'encrypt', { encAlg, key, nonce, payload }: CryptFnContext) {
  return new Uint8Array(await crypto.subtle[this]({ name: encAlg, iv: nonce }, key, payload));
}

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
export const WithWebCrypto: InstanceConfig = {
  cryptAlgs: Object.fromEntries(
    [
      //
      'AES-CBC',
      'AES-CTR',
      'AES-GCM',
      'AES-OCB',
      'ChaCha20-Poly1305',
      'RSA-OAEP',
    ].map((alg) => [alg, WebCrypto] as const),
  ),
};
