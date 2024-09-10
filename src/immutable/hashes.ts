import { Varint } from '../core.js';
import { Base58 } from '../internal/encoding.js';
import type { CIDLike } from './cid.js';

/** Hashing algorithms available to the SDK. */
export enum HashAlgorithm {
  /** Type code for SHA-256. */
  SHA256 = 0,
}

/** A parser for the hash part of the `ContentIdentifier` for immutable content. */
export class Hash {
  /** The full bytes. */
  public bytes: Uint8Array;

  constructor(
    /** A valid hash value. When a string is used, it must be base58 encoded. */
    value: CIDLike,
  ) {
    this.bytes =
      value instanceof Hash
        ? value.bytes
        : typeof value === 'string'
          ? Base58.decode(value)
          : new Uint8Array(value);
  }

  /** The algorithm integer. */
  get algorithm() {
    return new Varint(this.bytes);
  }

  /** The value as bytes. */
  get value() {
    return this.bytes.subarray(this.algorithm.encodingLength);
  }

  /** Gets a version encoded as human-readable base58 string. */
  toBase58() {
    return Base58.encode(this.bytes);
  }

  /** Alias for `toBase58`. */
  toString() {
    return this.toBase58();
  }
}

/**
 * Performs the hashing algorithm on the given buffer.
 *
 * @param alg The the type code of the hashing algorithm to use.
 * @param payload The buffer to perform hashing on.
 * @returns A promise that resolves with the {@linkcode Hash} output.
 */
export async function hash(alg: HashAlgorithm, payload: BufferSource): Promise<Hash> {
  switch (alg) {
    case HashAlgorithm.SHA256:
      return new Hash([alg, ...new Uint8Array(await sha256(payload))]);
    default:
      throw new TypeError('Unsupported algorithm');
  }
}

/**
 * Performs an iteration of SHA-256 on the given buffer.
 *
 * @param payload The buffer to perform hashing on.
 * @returns A promise that resolves with the hash buffer.
 */
export function sha256(payload: BufferSource) {
  return crypto.subtle.digest('SHA-256', payload);
}
