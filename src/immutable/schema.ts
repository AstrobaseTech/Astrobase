import { decodeWithCodec } from '../codec/codecs.js';
import { File } from '../file/file.js';
import type { IdentifierSchema } from '../identifiers/identifiers.js';
import { validateCID } from './cid.js';

/** {@linkcode IdentifierSchema} for immutable content-addressed files. */
export const Immutable = {
  /** Immutable data uses the identifier type `1`. */
  key: 1 as const,

  /**
   * Validates and parses an immutable KV pair.
   *
   * @param cid An immutable identifier.
   * @param content The content buffer.
   * @param instanceID The instance for codec resolution.
   */
  async parse(cid, content, instanceID?: string) {
    if (await validateCID(cid.value, content)) {
      const file = new File(content);
      return file.mediaType
        ? // Will throw if content is malformed or unsupported
          decodeWithCodec(file.payload, file.mediaType.value, instanceID)
        : file.payload;
    }
  },
} satisfies IdentifierSchema;
