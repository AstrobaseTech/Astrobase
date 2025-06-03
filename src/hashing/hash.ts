import { Varint } from '../varint/varint.js';
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
}
