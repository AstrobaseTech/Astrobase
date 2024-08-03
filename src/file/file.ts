import { decode, encodingLength } from 'varint';

export const SUPPORTED_FILE_VERSIONS = new Set([1]);
export const DEFAULT_FILE_VERSION = 1;

export const TIMESTAMP_BITMASK = 0b10000000;
export const MEDIA_TYPE_BITMASK = 0b01000000;

/**
 * Represents a File buffer loaded into memory and contains getters that parse the buffer to
 * retrieve values.
 *
 * @experimental
 */
export class FileBuilder {
  private _buffer: Uint8Array;

  constructor(fileBuffer: ArrayLike<number> | ArrayBufferLike = [DEFAULT_FILE_VERSION, 0]) {
    this._buffer = new Uint8Array(fileBuffer);
  }

  /** The raw, underlying buffer of the file. */
  get buffer(): Uint8Array {
    return this._buffer;
  }

  set buffer(fileBuffer: ArrayLike<number> | ArrayBufferLike) {
    this._buffer = new Uint8Array(fileBuffer);
  }

  /**
   * Set the raw buffer of the file.
   *
   * @returns The file, for method chaining.
   */
  setBuffer(fileBuffer: ArrayLike<number> | ArrayBufferLike) {
    this.buffer = fileBuffer;
    return this;
  }

  /**
   * The file encoding version integer. This is encoded as a varint for future-proofing. As of the
   * time of publishing this library, only encoding version `1` exists. No other file encoding
   * versions will be understood, so it is not possible to set this value.
   */
  get version() {
    return decode(this._buffer);
  }

  /** The number of bytes the version integer uses when encoded as a varint. */
  get versionEncodingLength() {
    return encodingLength(this.version);
  }

  /**
   * The value of the byte that contains the feature flags.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get flagsByte() {
    if (!SUPPORTED_FILE_VERSIONS.has(this.version)) {
      throw new TypeError('Unsupported file version');
    }
    return this._buffer[this.versionEncodingLength];
  }

  /**
   * Whether the file includes a timestamp.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get hasTimestamp() {
    return !!(this.flagsByte & TIMESTAMP_BITMASK);
  }

  /**
   * Whether the file includes a media type.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get hasMediaType() {
    return !!(this.flagsByte & MEDIA_TYPE_BITMASK);
  }

  /**
   * The Unix timestamp of the file. This is encoded as an unsigned 32 bit integer with granularity
   * to the second. If the file does not have a timestamp, this will be `undefined`.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get timestamp(): number | undefined {
    if (this.hasTimestamp) {
      return new DataView(
        this._buffer.buffer,
        this._buffer.byteOffset,
        this._buffer.byteLength,
      ).getUint32(this.versionEncodingLength + 1, true);
    }
  }

  set timestamp(timestamp: number) {
    if (!this.hasTimestamp) {
      // Extend the buffer and add space for the timestamp
      const versionBytes = this._buffer.subarray(0, this.versionEncodingLength);
      const flagsByte = this.flagsByte | TIMESTAMP_BITMASK; // Set the timestamp bit
      const postBytes = this._buffer.subarray(this.versionEncodingLength + 1);
      this._buffer = Uint8Array.from([...versionBytes, flagsByte, 0, 0, 0, 0, ...postBytes]);
    }

    new DataView(this._buffer.buffer, this._buffer.byteOffset, this._buffer.byteLength).setUint32(
      2,
      timestamp,
      true,
    );
  }

  /**
   * Set the Unix timestamp of the file.
   *
   * @param timestamp The number of seconds since Unix epoch UTC. If omitted, the current time will
   *   be used.
   * @returns The file, for method chaining.
   * @throws {TypeError} If the file version is unsupported.
   */
  setTimestamp(timestamp = Math.floor(Date.now() / 1000)) {
    this.timestamp = timestamp;
    return this;
  }

  clearTimestamp() {
    if (this.hasTimestamp) {
      // Shrink the buffer, removing the timestamp
      const versionBytes = this._buffer.subarray(0, this.versionEncodingLength);
      const flagsByte = this.flagsByte & ~TIMESTAMP_BITMASK; // Unset the timestamp bit
      const postBytes = this._buffer.subarray(this.versionEncodingLength + 5);
      this._buffer = Uint8Array.from([...versionBytes, flagsByte, ...postBytes]);
    }
    return this;
  }

  /**
   * The position, within the buffer, of the media type. If the file does not have a media type,
   * this will be `undefined`.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get mediaTypeEncodingStart() {
    if (this.hasMediaType) {
      return this.versionEncodingLength + (this.hasTimestamp ? 5 : 1);
    }
  }

  /**
   * The position, within the buffer, of the `NUL` termination byte. If the file does not have a
   * media type, this will be `undefined`.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get mediaTypeEncodingEnd() {
    const start = this.mediaTypeEncodingStart;
    if (start) {
      for (let i = start + 3; i < 128; i++) {
        if (this._buffer[i] === undefined) {
          throw new RangeError();
        }
        if (this._buffer[i] == 0) {
          return i;
        }
      }
    }
  }

  /**
   * The media type as a buffer. If the file does not have a media type, this will be `undefined`.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get mediaType() {
    const end = this.mediaTypeEncodingEnd;
    if (end) {
      return this._buffer.slice(this.mediaTypeEncodingStart, end);
    }
  }

  /**
   * The contents of the file.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get payload() {
    return this._buffer.slice(
      (this.mediaTypeEncodingEnd ?? this.versionEncodingLength + (this.hasTimestamp ? 4 : 0)) + 1,
    );
  }
}
