import { format, type MediaType } from 'content-type';

/**
 * Encodes a media type as ASCII bytes.
 *
 * @param mediaType The media type string or object.
 * @returns The encoded ASCII as an array of bytes.
 */
export function encodeMediaType(mediaType: string | MediaType) {
  return new TextEncoder().encode(typeof mediaType === 'string' ? mediaType : format(mediaType));
}

/**
 * Validates media type ASCII bytes (minus the NUL terminator byte). Valid media types use only
 * alphanumeric characters and dashes, with one forward slash separator, and cannot be longer than
 * 127 characters.
 *
 * @param mediaType The media type ASCII bytes.
 * @returns `true` if the media type is valid. `false` otherwise.
 */
export function validateMediaType(mediaType: Uint8Array): boolean {
  let once = false;
  let slashCount = 0;

  if (mediaType.length > 127) {
    return false;
  }

  for (const byte of mediaType) {
    if (
      // Control char
      byte < 0x20 ||
      // Back slash
      byte == 0x5c ||
      // DEL
      byte == 0x7f ||
      // Forward slash (at beginning or multiple)
      (byte == 0x2f && (!once || ++slashCount > 1))
    ) {
      return false;
    }
    once = true;
  }

  return slashCount == 1;
}
