import { decodeWithCodec } from '../codec/codecs.js';
import { FileBuilder } from '../file/file.js';
import type { IdentifierSchema } from '../identifiers/identifiers.js';
import { validateCID } from './cid.js';

/** {@linkcode IdentifierSchema} for immutable content-addressed files. */
export const Immutable = {
  key: 1,
  async parse(cid, content, instanceID?: string) {
    if (await validateCID(cid.value, content)) {
      const file = new FileBuilder(content);
      return file.mediaType
        ? // Will throw if content is malformed or unsupported
          decodeWithCodec(file.payload, file.mediaType, instanceID)
        : file.payload;
    }
  },
} satisfies IdentifierSchema;
