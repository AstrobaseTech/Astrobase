/**
 * Implements an encoder that converts values to and from base-x strings and `Uint8Array`.
 *
 * @category Encoding
 */
export interface BaseEncoder {
  /**
   * Decodes the encoded string to bytes.
   *
   * @param encoded The encoded string.
   * @returns The raw bytes.
   */
  decode(encoded: string): Uint8Array<ArrayBuffer>;
  /**
   * Encodes bytes into a string.
   *
   * @param input The bytes to encode.
   * @returns The encoded string.
   */
  encode(input: Uint8Array<ArrayBuffer>): string;
}

/**
 * A base64 encoder.
 *
 * @category Encoding
 */
export const Base64: BaseEncoder = {
  /**
   * Decodes the base64 encoded string to bytes.
   *
   * @param encoded The base64 encoded string.
   * @returns The raw bytes.
   */
  decode: (encoded: string) => stringToBytes(atob(encoded)),
  /**
   * Encodes bytes into a base64 string.
   *
   * @param input The bytes to encode.
   * @returns A base64 encoded string.
   */
  encode: (input: Uint8Array<ArrayBuffer>) => btoa(bytesToString(input)),
};

/**
 * Decode a a string to individual bytes by char code.
 *
 * @category Encoding
 * @param string A string.
 * @returns A `Uint8Array`.
 */
export const stringToBytes = (string: string) =>
  new Uint8Array(Array.from(string, (_, k) => string.charCodeAt(k)));

/**
 * Encode individual bytes to string by char code.
 *
 * @category Encoding
 * @param bytes An array of byte values or `ArrayBufferLike`.
 * @returns A string.
 */
export function bytesToString(bytes: ArrayBuffer | ArrayLike<number>) {
  let output = '';
  for (const byte of new Uint8Array(bytes)) {
    output += String.fromCharCode(byte);
  }
  return output;
}

/**
 * Coerces a payload-like value to a `Uint8Array`.
 *
 * @category Encoding
 * @param input An array of byte values, `ArrayBufferLike`, or base64 encoded string.
 * @returns A `Uint8Array`.
 */
export const payloadToBytes = (input: ArrayLike<number> | ArrayBuffer | string) =>
  typeof input === 'string' ? Base64.decode(input) : new Uint8Array(input);

/**
 * Compares two byte arrays.
 *
 * @returns `true` if they match, `false` if not.
 */
export function compareBytes(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
