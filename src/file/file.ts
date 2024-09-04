import type { MediaType } from 'content-type';
import { decodeWithCodec, encodeWithCodec } from '../codec/codecs.js';
import { Ascii } from '../encoding/ascii.js';
import { Varint } from '../encoding/varint.js';
import { encodeMediaType, validateMediaType } from './media-types.js';

/** A set of {@linkcode File} protocol versions supported by the SDK. */
export const SUPPORTED_FILE_VERSIONS = new Set([1]);

/** The default {@linkcode File} protocol version to use for new files. */
export const DEFAULT_FILE_VERSION = 1;

/** The bitmask for the timestamp feature flag bit. */
export const TIMESTAMP_BITMASK = 0b10000000;

/** The bitmask for the media type feature flag bit. */
export const MEDIA_TYPE_BITMASK = 0b01000000;

/**
 * Represents a File buffer loaded into memory and contains getters that parse the buffer to
 * retrieve values.
 */
export class File {
  private _buffer: Uint8Array;

  constructor(fileBuffer: ArrayLike<number> | ArrayBufferLike = [DEFAULT_FILE_VERSION, 0]) {
    this._buffer = new Uint8Array(fileBuffer);
  }

  /** The raw, underlying buffer of the file. */
  get buffer(): Uint8Array {
    return this._buffer;
  }

  /** Sets the raw, underlying buffer of the file. */
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

  /** The File encoding version integer. */
  get version() {
    return new Varint(this._buffer);
  }

  /**
   * The value of the byte that contains the feature flags.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get flagsByte() {
    if (!SUPPORTED_FILE_VERSIONS.has(this.version.value)) {
      throw new TypeError('Unsupported file version');
    }
    return this._buffer[this.version.encodingLength];
  }

  /**
   * Whether the file includes a timestamp.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get hasTimestamp() {
    return !!(this.flagsByte & TIMESTAMP_BITMASK);
  }

  /**
   * Whether the file includes a media type.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get hasMediaType() {
    return !!(this.flagsByte & MEDIA_TYPE_BITMASK);
  }

  /**
   * The file's Unix timestamp. If the file does not have a timestamp, this will be `undefined`.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get timestamp(): number | undefined {
    if (this.hasTimestamp) {
      return new DataView(
        this._buffer.buffer,
        this._buffer.byteOffset,
        this._buffer.byteLength,
      ).getUint32(this.version.encodingLength + 1, true);
    }
  }

  /**
   * Sets the file's Unix timestamp.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  set timestamp(timestamp: number) {
    if (!this.hasTimestamp) {
      // Extend the buffer and add space for the timestamp
      const versionBytes = this._buffer.subarray(0, this.version.encodingLength);
      const flagsByte = this.flagsByte | TIMESTAMP_BITMASK; // Set the timestamp bit
      const postBytes = this._buffer.subarray(this.version.encodingLength + 1);
      this._buffer = Uint8Array.from([...versionBytes, flagsByte, 0, 0, 0, 0, ...postBytes]);
    }

    new DataView(this._buffer.buffer, this._buffer.byteOffset, this._buffer.byteLength).setUint32(
      2,
      timestamp,
      true,
    );
  }

  /**
   * Sets the file's Unix timestamp.
   *
   * @param timestamp The number of seconds since Unix epoch. If omitted, the current time will be
   *   used.
   * @returns The file, for method chaining.
   * @throws `TypeError` if the file version is unsupported.
   */
  setTimestamp(timestamp = Math.floor(Date.now() / 1000)) {
    this.timestamp = timestamp;
    return this;
  }

  /**
   * Clear's the file's Unix timestamp.
   *
   * @returns The file, for method chaining.
   * @throws `TypeError` if the file version is unsupported.
   */
  clearTimestamp() {
    if (this.hasTimestamp) {
      // Shrink the buffer, removing the timestamp
      const versionBytes = this._buffer.subarray(0, this.version.encodingLength);
      const flagsByte = this.flagsByte & ~TIMESTAMP_BITMASK; // Unset the timestamp bit
      const postBytes = this._buffer.subarray(this.version.encodingLength + 5);
      this._buffer = Uint8Array.from([...versionBytes, flagsByte, ...postBytes]);
    }
    return this;
  }

  /**
   * The file's media type. If the file does not have a media type, this will be `undefined`.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get mediaType(): Ascii | undefined {
    if (this.hasMediaType) {
      return new Ascii(this._buffer, this.version.encodingLength + (this.hasTimestamp ? 5 : 1));
    }
  }

  /**
   * Sets the file's media type.
   *
   * @param mediaType The media type string or object.
   * @throws `TypeError` if the file version is unsupported.
   */
  set mediaType(mediaType: string | MediaType) {
    const encodedMediaType = encodeMediaType(mediaType);

    if (!validateMediaType(encodedMediaType)) {
      throw new TypeError('Invalid media type');
    }

    const versionBytes = this.buffer.subarray(0, this.version.encodingLength);
    const flagsByte = this.flagsByte | MEDIA_TYPE_BITMASK; // Set the media type bit
    const timestampBytes = this.hasTimestamp
      ? this._buffer.subarray(this.version.encodingLength + 1, this.version.encodingLength + 5)
      : [];
    this._buffer = Uint8Array.from([
      ...versionBytes,
      flagsByte,
      ...timestampBytes,
      ...encodedMediaType,
      0,
      ...this.payload,
    ]);
  }

  /**
   * Sets the file's media type.
   *
   * @param mediaType The media type string or object.
   * @returns The file, for method chaining.
   * @throws `TypeError` if the file version is unsupported.
   */
  setMediaType(mediaType: string | MediaType) {
    this.mediaType = mediaType;
    return this;
  }

  /**
   * The position, within the buffer, of the first payload byte.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get payloadEncodingStart() {
    return (
      (this.mediaType?.encodingEnd ?? this.version.encodingLength + (this.hasTimestamp ? 4 : 0)) + 1
    );
  }

  /**
   * The contents of the file.
   *
   * @throws `TypeError` if the file version is unsupported.
   */
  get payload(): Uint8Array {
    return this._buffer.subarray(this.payloadEncodingStart);
  }

  /**
   * Sets the file's payload.
   *
   * @param payload The payload.
   * @throws `TypeError` if the file version is unsupported.
   */
  set payload(payload: ArrayLike<number> | ArrayBufferLike) {
    const preBytes = this.buffer.subarray(0, this.payloadEncodingStart);
    this.buffer = Uint8Array.from([...preBytes, ...new Uint8Array(payload)]);
  }

  /**
   * Sets the file's payload.
   *
   * @param payload The payload.
   * @returns The file, for method chaining.
   * @throws `TypeError` if the file version is unsupported.
   */
  setPayload(payload: ArrayLike<number> | ArrayBufferLike) {
    this.payload = payload;
    return this;
  }

  /**
   * Get the decoded value of the file payload. If the media type is not set, this will always
   * return the same as `.payload`. Otherwise, it will attempt to decode with the registered codec
   * for the media type and return the result.
   *
   * @template T The type of the returned codec-decoded result.
   * @param instanceID The instance ID to use when looking up available codecs.
   * @throws `TypeError` if the file version is unsupported.
   */
  async getValue<T = unknown>(instanceID?: string) {
    return this.mediaType
      ? decodeWithCodec<T>(this.payload, this.mediaType.value, instanceID)
      : this.payload;
  }

  /**
   * Sets the file payload by passing a decoded value. The media type must already be set to use
   * this method. The value will be encoded using the codec registered for the file's media type.
   *
   * @template T The type of the value being provided. This may be useful for type checking when
   *   inlining the value parameter.
   * @param value The value to encode and use as the file payload.
   * @param instanceID The instance ID to use when looking up available codecs.
   * @returns The file, for method chaining.
   * @throws `TypeError` if the file version is unsupported.
   */
  async setValue<T = unknown>(value: T, instanceID?: string) {
    if (!this.mediaType) {
      throw new TypeError('Cannot use `setValue` without a media type set');
    }
    return this.setPayload(await encodeWithCodec(value, this.mediaType.value, instanceID));
  }
}
