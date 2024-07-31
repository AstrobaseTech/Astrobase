import { decode, encodingLength } from 'varint';

/**
 * Represents a File buffer loaded into memory. This class features getters that parse the buffer to
 * return file metadata or the payload.
 *
 * @experimental
 */
export class File {
  buffer;

  constructor(fileBuffer: Uint8Array | number[] = [1, 0]) {
    this.buffer = fileBuffer;
  }

  /**
   * The file encoding version integer. This is encoded as a varint for future-proofing. As of the
   * time of publishing this library, only encoding version `1` exists, so no other file encoding
   * versions will be understood.
   */
  get version() {
    return decode(this.buffer);
  }

  /** The number of bytes the version integer uses when encoded as a varint. */
  get versionEncodingLength() {
    return encodingLength(this.version);
  }

  /**
   * The value of the byte that contains the feature flags.
   *
   * @throws {TypeError} If file version is unrecognised.
   */
  get flagsByte() {
    if (this.version != 1) {
      throw new TypeError('Unrecognised file version');
    }
    return this.buffer[this.versionEncodingLength];
  }

  /**
   * Whether the file includes a timestamp.
   *
   * @throws {TypeError} If file version is unrecognised.
   */
  get hasTimestamp() {
    return !!(this.flagsByte & 0b10000000);
  }

  /**
   * Whether the file includes a media type.
   *
   * @throws {TypeError} If file version is unrecognised.
   */
  get hasMediaType() {
    return !!(this.flagsByte & 0b01000000);
  }

  /**
   * The Unix timestamp of the file. This is encoded as an unsigned 32 bit integer with granularity
   * to the second.
   *
   * @throws {TypeError} If file version is unrecognised.
   */
  get timestamp() {
    if (this.hasTimestamp) {
      let timestamp = 0;
      for (let i = this.versionEncodingLength + 1, j = 0; j != 32; i++, j += 8) {
        timestamp += this.buffer[i] << j;
      }
      return timestamp;
    }
  }

  /**
   * The position, within the buffer, of the media type. If the file does not have a media type,
   * this will be `undefined`.
   *
   * @throws {TypeError} If file version is unrecognised.
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
   * @throws {TypeError} If file version is unrecognised.
   */
  get mediaTypeEncodingEnd() {
    const start = this.mediaTypeEncodingStart;
    if (start) {
      // eslint-disable-next-line no-constant-condition
      for (let i = start + 3; true; i++) {
        if (this.buffer[i] == 0) {
          return i;
        }
      }
    }
  }

  /**
   * The media type as a buffer. If the file does not have a media type, this will be `undefined`.
   *
   * @throws {TypeError} If file version is unrecognised.
   */
  get mediaType() {
    const end = this.mediaTypeEncodingEnd;
    if (end) {
      return this.buffer.slice(this.mediaTypeEncodingStart, end);
    }
  }

  /**
   * The contents of the file.
   *
   * @throws {TypeError} If file version is unrecognised.
   */
  get payload() {
    return this.buffer.slice(
      (this.mediaTypeEncodingEnd ?? this.versionEncodingLength + (this.hasTimestamp ? 4 : 0)) + 1,
    );
  }
}
