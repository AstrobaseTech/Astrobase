import { decode, encodingLength } from 'varint';

export const SUPPORTED_FILE_VERSIONS = new Set([1]);
export const DEFAULT_FILE_VERSION = 1;

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

  get buffer(): Uint8Array {
    return this._buffer;
  }

  set buffer(fileBuffer: ArrayLike<number> | ArrayBufferLike) {
    this._buffer = new Uint8Array(fileBuffer);
  }

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
    return !!(this.flagsByte & 0b10000000);
  }

  /**
   * Whether the file includes a media type.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get hasMediaType() {
    return !!(this.flagsByte & 0b01000000);
  }

  /**
   * The Unix timestamp of the file. This is encoded as an unsigned 32 bit integer with granularity
   * to the second. If the file does not have a timestamp, this will be `undefined`.
   *
   * @throws {TypeError} If the file version is unsupported.
   */
  get timestamp() {
    if (this.hasTimestamp) {
      return new DataView(
        this._buffer.buffer,
        this._buffer.byteOffset,
        this._buffer.byteLength,
      ).getUint32(2, true);
    }
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
