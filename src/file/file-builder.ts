import type { MediaType } from 'content-type';
import { Ascii } from '../ascii/ascii.js';
import { decodeWithCodec, encodeWithCodec } from '../codecs/codecs.js';
import type { Instance } from '../instance/instance.js';
import { encodeMediaType, validateMediaType } from '../media-types/media-types.js';

/**
 * Represents a File buffer loaded into memory and contains getters & setters that parse the buffer
 * to retrieve or set values.
 */
export class FileBuilder<T = unknown> {
  /** The raw, underlying buffer of the file. */
  buffer: Uint8Array<ArrayBuffer>;

  constructor(fileBuffer: ArrayLike<number> | ArrayBuffer = [0]) {
    this.buffer = new Uint8Array(fileBuffer);
  }

  /**
   * Set the raw buffer of the file.
   *
   * @returns This file for method chaining.
   */
  setBuffer(fileBuffer: ArrayLike<number> | ArrayBuffer) {
    this.buffer = new Uint8Array(fileBuffer);
    return this;
  }

  /**
   * The file's media type. An empty media type is treated as `application/octet-stream` (raw
   * bytes).
   */
  get mediaType() {
    return new Ascii(this.buffer);
  }

  /**
   * `true` if the media type is set, `false` otherwise. An unset (empty) media type is treated as
   * `application/octet-stream` (raw bytes).
   */
  get hasMediaType() {
    return this.mediaType.encodingEnd != 0;
  }

  /**
   * Sets the file's media type.
   *
   * @param mediaType The media type string or object.
   * @returns This file for method chaining.
   * @throws `TypeError` if the media type is invalid.
   */
  setMediaType(mediaType: string | MediaType) {
    const encodedMediaType = encodeMediaType(mediaType);

    if (encodeMediaType.length && !validateMediaType(encodedMediaType)) {
      throw new TypeError('Invalid media type');
    }

    this.buffer = new Uint8Array([...encodedMediaType, 0, ...this.payload]);

    return this;
  }

  /** The position, within the buffer, of the first payload byte. */
  get payloadEncodingStart() {
    return this.mediaType.encodingEnd + 1;
  }

  /** The file payload bytes. */
  get payload(): Uint8Array<ArrayBuffer> {
    return this.buffer.subarray(this.payloadEncodingStart);
  }

  /**
   * Sets the file's payload.
   *
   * @param payload The payload.
   * @returns This file for method chaining.
   */
  setPayload(payload: ArrayLike<number> | ArrayBuffer) {
    this.buffer = Uint8Array.from([
      ...this.buffer.subarray(0, this.payloadEncodingStart),
      ...new Uint8Array(payload),
    ]);
    return this;
  }

  /**
   * Get the decoded value of the file payload. If the media type is not set, this will always
   * return the same as `.payload`. Otherwise, it will attempt to decode with the registered codec
   * for the media type and return the result.
   *
   * @param instance The instance to use when looking up available codecs.
   * @returns A promise that resolves with the decoded content. The type of the content is unknown,
   *   as we cannot anticipate how registered middleware will behave. You will need to assert the
   *   output type yourself.
   */
  getValue(instance: Instance) {
    return this.buffer[0] != 0
      ? (decodeWithCodec(instance, this.payload, this.mediaType.value) as Promise<T>)
      : this.payload;
  }

  /**
   * Sets the file payload by passing a decoded value. The media type must already be set to use
   * this method. The value will be encoded using the codec registered for the file's media type.
   *
   * @template T The type of the value being provided. This may be useful for type checking when
   *   inlining the value parameter.
   * @param value The value to encode and use as the file payload.
   * @param instance The instance to use when looking up available codecs.
   * @returns A promise that resolves with this file for method chaining.
   * @throws `TypeError` if no media type is set.
   */
  async setValue(value: T, instance: Instance) {
    if (this.buffer[0] == 0) {
      throw new TypeError('Cannot use `setValue` without a media type set');
    }
    return this.setPayload(await encodeWithCodec(instance, value, this.mediaType.value));
  }
}
