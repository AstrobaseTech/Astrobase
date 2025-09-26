/** @module ASCII */

/**
 * Parses a NUL terminated ASCII string within binary.
 *
 * @example
 *
 * ```js
 * import { Ascii } from '@astrobase/sdk/ascii';
 *
 * const bytes = [72, 101, 108, 108, 111, 0];
 * const offset = 0;
 *
 * const ascii = new Ascii(bytes, offset);
 *
 * console.log(ascii.value); // 'Hello'
 * console.log(ascii.encodingEnd); // 5
 * ```
 */
export class Ascii {
  private readonly buffer: Uint8Array<ArrayBuffer>;

  constructor(
    /** The binary containing the ASCII string. */
    buffer: ArrayBuffer | ArrayLike<number>,
    /** The byte index where the ASCII string begins. Defaults to the start of the buffer. */
    readonly encodingStart = 0,
  ) {
    this.buffer = new Uint8Array(buffer);
  }

  /**
   * The byte index of the `NUL` terminator byte.
   *
   * @throws `RangeError` if the end of the buffer was reached without finding the terminator.
   */
  get encodingEnd() {
    for (let i = this.encodingStart; i < this.buffer.length; i++) {
      if (this.buffer[i] == 0) {
        return i;
      }
    }
    throw new RangeError('Missing NUL');
  }

  /**
   * The ASCII encoded value as a string.
   *
   * @throws `RangeError` if the end of the buffer was reached without finding the terminator.
   */
  get value() {
    return new TextDecoder().decode(this.buffer.subarray(this.encodingStart, this.encodingEnd));
  }
}
