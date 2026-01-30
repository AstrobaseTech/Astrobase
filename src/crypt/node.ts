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
import { assembleCryptoInstanceConfig } from './assemble-instance-config.js';

export const NodeSupportedCryptAlgs = [
  'AES-GCM',
  // 'AES-OCB', // TODO(feat): add support: Unrecognized algorithm name because of WebCrypto KDF
  // 'ChaCha20-Poly1305' // TODO(feat): add support: Unrecognized algorithm name because of WebCrypto KDF
] as const;
export type NodeSupportedCryptAlg = (typeof NodeSupportedCryptAlgs)[number];

type NodeAlg = NC.CipherGCMTypes | NC.CipherOCBTypes | NC.CipherChaCha20Poly1305Types;

const toNodeAlg = {
  'AES-GCM': 'aes-256-gcm',
} as const satisfies Record<NodeSupportedCryptAlg, NodeAlg>;

/**
 * An {@link CryptModule} that implements encryption using the `node:crypto` API for supported
 * algorithms.
 */
export const NodeCrypto: CryptModule = {
  async decrypt({ encAlg, key, nonce, payload }) {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    encAlg = toNodeAlg[encAlg as NodeSupportedCryptAlg];
    const cipher = createDecipheriv(encAlg, Buffer.from(rawKey), nonce) as NC.DecipherGCM;
    const tagStart = payload.length - 16;
    cipher.setAuthTag(payload.slice(tagStart));
    return Buffer.concat([cipher.update(payload.slice(0, tagStart)), cipher.final()]);
  },
  async encrypt({ encAlg, key, nonce, payload }) {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    encAlg = toNodeAlg[encAlg as NodeSupportedCryptAlg];
    const cipher = createCipheriv(encAlg, Buffer.from(rawKey), nonce) as NC.CipherGCM;
    return Buffer.concat([cipher.update(payload), cipher.final(), cipher.getAuthTag()]);
  },
};

/**
 * An {@link InstanceConfig} that provides `cryptAlgs` for algorithms supported by the the
 * `node:crypto` API.
 */
export const WithNodeCrypto: InstanceConfig = assembleCryptoInstanceConfig(
  NodeCrypto,
  NodeSupportedCryptAlgs,
);
