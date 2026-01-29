/**
 * Provides support for using the `node:crypto` API for with the Crypt module.
 *
 * @module Crypt/Node
 * @experimental
 */

import { createCipheriv, createDecipheriv } from 'node:crypto';
import type * as NC from 'node:crypto';
import type { InstanceConfig } from '../instance/instance.js';
import type { CryptModule } from './types.js';

/**
 * An {@link CryptModule} that implements encryption using the `node:crypto` API for supported
 * algorithms.
 */
export const NodeCrypto: CryptModule = {
  async decrypt({ encAlg, key, nonce, payload }) {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    const cipher = createDecipheriv(encAlg, Buffer.from(rawKey), nonce);
    const tagStart = payload.length - 16;
    type D = NC.DecipherCCM | NC.DecipherOCB | NC.DecipherGCM | NC.DecipherChaCha20Poly1305;
    (cipher as D).setAuthTag(payload.slice(tagStart));
    return Buffer.concat([cipher.update(payload.slice(0, tagStart)), cipher.final()]);
  },
  async encrypt({ encAlg, key, nonce, payload }) {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    const cipher = createCipheriv(encAlg, Buffer.from(rawKey), nonce);
    type C = NC.CipherCCM | NC.CipherOCB | NC.CipherGCM | NC.CipherChaCha20Poly1305;
    return Buffer.concat([cipher.update(payload), cipher.final(), (cipher as C).getAuthTag()]);
  },
};

/**
 * An {@link InstanceConfig} that provides `cryptAlgs` for algorithms supported by the the
 * `node:crypto` API.
 */
export const WithNodeCrypto: InstanceConfig = {
  cryptAlgs: Object.fromEntries(
    [
      'aes-128-ccm',
      'aes-192-ccm',
      'aes-256-ccm',
      'aes-128-gcm',
      'aes-192-gcm',
      'aes-256-gcm',
      'aes-128-ocb',
      'aes-192-ocb',
      'aes-256-ocb',
      'chacha20-poly1305',
    ].map((alg) => [alg, NodeCrypto]),
  ),
};
