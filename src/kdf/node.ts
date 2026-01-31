/**
 * Provides support for using the `node:crypto` API with the KDF module.
 *
 * @module KDF/Node
 * @experimental
 */

import { pbkdf2Sync } from 'node:crypto';
import type { InstanceConfig } from '../instance/instance.js';
import type { KeyDerivationFn } from '../kdf/kdf.js';

export const NodeKDFs = [
  'PBKDF2',
  // 'scrypt', // TODO(feat): add support
  // 'HKDF' // TODO(feat): add support
] as const;

export type NodeKDF = (typeof NodeKDFs)[number];

/** A {@link KeyDerivationFn} using the `node:crypto` implementation of `PBKDF2`. */
export const NodePBKDF2: KeyDerivationFn = (options) =>
  new Uint8Array(
    pbkdf2Sync(options.input, options.salt, options.iterations, options.keyLen, options.hashAlg),
  );

export const NodeKDF: Record<NodeKDF, KeyDerivationFn> = {
  PBKDF2: NodePBKDF2,
};

/**
 * An {@link InstanceConfig} that provides `kdf` for algorithms supported by the the `node:crypto`
 * API.
 */
export const WithNodeKDF: InstanceConfig = { kdf: NodeKDF };
