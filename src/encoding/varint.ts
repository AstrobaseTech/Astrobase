import v from 'varint';

/** Parses a Protobuf style varint within a buffer. */
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
