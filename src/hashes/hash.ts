import { Varint } from '../encoding/varint.js';
import { Base58 } from '../internal/encoding.js';
import type { HashLike } from './types.js';
import { hashToBytes } from './utils.js';

/** A parser for the hash part of the `ContentIdentifier` for immutable content. */
export class Hash {
  /** The full bytes. */
  public bytes: Uint8Array;

  constructor(
    /** A valid hash value. When a string is used, it must be base58 encoded. */
    value: HashLike,
  ) {
    this.bytes = hashToBytes(value);
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
