import { ContentIdentifier } from '../identifiers/identifiers.js';
import { Base58, Base64, type BaseEncoder } from '../internal/encoding.js';
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
    for (const C of [ArrayBuffer, Uint8Array]) {
      if (value instanceof C) {
        return `$bin:b64:${Base64.encode(new Uint8Array(value))}`;
      }
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
    if (
      typeof value !== 'string' ||
      value.length < 9 ||
      !value.startsWith('$') ||
      value.charAt(4) !== ':' ||
      value.charAt(8) !== ':'
    ) {
      return value;
    }

    // TODO(fix): NEED a dedicated global ReferenceMiddleware
    const isRefSlice = value.slice(1, 4);
    let isRef: boolean;
    if (isRefSlice === 'ref') {
      isRef = true;
    } else if (isRefSlice === 'bin') {
      isRef = false;
    } else {
      return value;
    }

    const encodingSlice = value.slice(5, 8);
    let encoder: BaseEncoder;
    if (encodingSlice === 'b58') {
      encoder = Base58;
    } else if (encodingSlice === 'b64') {
      encoder = Base64;
    } else {
      return value;
    }

    const decoded = encoder.decode(value.slice(9));

    return isRef ? new ContentIdentifier(decoded) : decoded;
  },
} satisfies Middleware;
