/**
 * Provides support for using the WebCrypto API for with the Crypt module.
 *
 * @module Crypt/WebCrypto
 * @experimental
 */

import type { InstanceConfig } from '../instance/instance.js';
import type { CryptModule } from './types.js';

/**
 * An {@link CryptModule} that implements encryption using the WebCrypto API for supported
 * algorithms.
 */
export const WebCrypto: CryptModule = {
  decrypt: async ({ encAlg, key, nonce, payload }) =>
    crypto.subtle.decrypt({ name: encAlg, iv: nonce }, key, payload),
  encrypt: async ({ encAlg, key, nonce, payload }) =>
    crypto.subtle.encrypt({ name: encAlg, iv: nonce }, key, payload),
};

/**
 * An {@link InstanceConfig} that provides `cryptAlgs` for algorithms supported by the the WebCrypto
 * API.
 */
export const WithWebCrypto: InstanceConfig = {
  cryptAlgs: {
    'AES-GCM': WebCrypto,
  },
};
