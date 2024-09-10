import { File } from '../file/file.js';
import type { ContentIdentifierScheme } from '../identifiers/identifiers.js';
import { validateCID } from './cid.js';

/** {@linkcode ContentIdentifierScheme} for immutable content-addressed files. */
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
    if (await validateCID(cid.rawValue, content)) {
      const file = new File(content);
      await file.getValue(instanceID); // validate
      return file;
    }
  },
} satisfies ContentIdentifierScheme<File>;
