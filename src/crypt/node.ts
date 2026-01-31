/**
 * Provides support for using the `node:crypto` API with the Crypt module.
 *
 * @module Crypt/Node
 * @experimental
 */

import { createCipheriv, createDecipheriv } from 'node:crypto';
import type * as NC from 'node:crypto';
import type { InstanceConfig } from '../instance/instance.js';
import type { CryptModule } from './types.js';

export const NodeCryptAlgs = ['AES-GCM', 'AES-OCB', 'ChaCha20-Poly1305'] as const;

export type NodeCryptAlg = (typeof NodeCryptAlgs)[number];

const toNodeAlg = {
  'AES-GCM': 'aes-256-gcm',
  'AES-OCB': 'aes-256-ocb',
  'ChaCha20-Poly1305': 'chacha20-poly1305',
} as const satisfies Record<
  NodeCryptAlg,
  NC.CipherGCMTypes | NC.CipherOCBTypes | NC.CipherChaCha20Poly1305Types
>;

/**
 * An {@link CryptModule} that implements encryption using the `node:crypto` API for supported
 * algorithms.
 */
export const NodeCryptModule: CryptModule = {
  decrypt({ encAlg, key, nonce, payload }) {
    const alg = toNodeAlg[encAlg as NodeCryptAlg];
    let cipher;
    if (alg === 'aes-256-ocb') {
      cipher = createDecipheriv(alg, key, nonce, { authTagLength: 16 });
    } else {
      cipher = createDecipheriv(alg, key, nonce) as NC.DecipherGCM;
    }
    const tagStart = payload.length - 16;
    cipher.setAuthTag(payload.slice(tagStart));
    return Buffer.concat([cipher.update(payload.slice(0, tagStart)), cipher.final()]);
  },
  encrypt({ encAlg, key, nonce, payload }) {
    const alg = toNodeAlg[encAlg as NodeCryptAlg];
    let cipher;
    if (alg === 'aes-256-ocb') {
      cipher = createCipheriv(alg, key, nonce, { authTagLength: 16 });
    } else {
      cipher = createCipheriv(alg, key, nonce) as NC.CipherGCM;
    }
    return Buffer.concat([cipher.update(payload), cipher.final(), cipher.getAuthTag()]);
  },
};

export const NodeCrypt: Record<NodeCryptAlg, CryptModule> = {
  'AES-GCM': NodeCryptModule,
  'AES-OCB': NodeCryptModule,
  'ChaCha20-Poly1305': NodeCryptModule,
};

/**
 * An {@link InstanceConfig} that provides `cryptAlgs` for algorithms supported by the the
 * `node:crypto` API.
 */
export const WithNodeCrypt = { cryptAlgs: NodeCrypt } satisfies InstanceConfig;
