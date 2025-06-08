/** @module Varint */

import v from 'varint';

/**
 * Parses a Protobuf style varint within binary.
 *
 * @example
 *
 * ```js
 * import { Varint } from '@astrobase/sdk/varint';
 *
 * const bytes = new Uint8Array([233, 15]);
 * const offset = 0;
 *
 * const varint = new Varint(bytes, offset);
 *
 * console.log(varint.value); // 2025
 * ```
 */
export class Varint {
  constructor(
    private readonly buffer: Uint8Array,
    private readonly offset?: number,
  ) {}

  /** The integer value of the varint. */
  get value() {
    return v.decode(this.buffer, this.offset);
  }

  /** The number of bytes that the integer uses when encoded as varint. */
  get encodingLength() {
    return v.encodingLength(this.value);
  }
}
