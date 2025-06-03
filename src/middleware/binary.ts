import { ContentIdentifier } from '../cid/cid.js';
import { FileBuilder } from '../file/file-builder.js';
import { Base64 } from '../internal/encoding.js';
import type { Middleware } from './types.js';

/** A middleware to swap binary streams for base encoded strings. */
export const BinaryMiddleware = {
  /**
   * Replaces a binary stream with a string representation.
   *
   * @param _ The key is unused.
   * @param value The value to check and replace.
   * @returns A string representation of the value, or the original value if not a supported binary
   *   stream.
   */
  replacer: (_, value) => {
    if (value instanceof ContentIdentifier) {
      return `$cid:${value.toString()}`;
    }

    if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
      return `$bin:b64:${Base64.encode(new Uint8Array(value))}`;
    }

    if (value instanceof FileBuilder) {
      return `$content:b64:${Base64.encode(value.buffer)}`;
    }

    return value;
  },

  /**
   * Revives a string representation of a binary stream into a real binary stream.
   *
   * @param _ The key is unused.
   * @param value The value to check and replace.
   * @returns A binary stream, or the original value if not a supported string.
   */
  reviver(_: unknown, value: unknown) {
    if (typeof value === 'string' && value.length >= 5 && value.startsWith('$')) {
      if (value.slice(1, 5) === 'cid:') {
        return new ContentIdentifier(value.slice(5));
      }

      if (value.slice(1, 9) === 'bin:b64:') {
        return Base64.decode(value.slice(9));
      }

      if (value.slice(1, 13) === 'content:b64:') {
        return new FileBuilder(Base64.decode(value.slice(13)));
      }
    }

    return value;
  },
} satisfies Middleware;
