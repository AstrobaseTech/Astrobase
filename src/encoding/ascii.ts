/**
 * Common class for parsing ASCII strings in buffers.
 *
 * @category Classes
 */
export class Ascii {
  constructor(
    private readonly buffer: Uint8Array,
    /** The position in the buffer where the string begins. */
    readonly encodingStart = 0,
  ) {}

  /**
   * The position of the `NUL` terminator byte.
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
