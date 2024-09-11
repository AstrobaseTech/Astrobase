import type { File } from '../file/file.js';
import { parse } from '../file/parse.js';
import type { ContentIdentifierScheme } from '../identifiers/identifiers.js';
import { validateCID } from './cid.js';

/**
 * The {@linkcode ContentIdentifierScheme} for immutable, content-addressed files. The scheme is
 * automatically registered globally.
 */
export const Immutable = {
  /** Immutable data uses the content identifier type `1`. */
  key: 1 as const,

  /**
   * The parse handler for the {@linkcode Immutable} {@linkcode ContentIdentifierScheme}. This handler
   * wraps the parse handler provided by the File module and additionally validates the hash within
   * the content identifier.
   *
   * @param cid An immutable content identifier.
   * @param content The content buffer.
   * @param instanceID The instance for codec resolution.
   * @returns The parsed {@linkcode File}.
   * @throws If the parsing and handoff to the middleware and codec systems fail, that error is
   *   thrown.
   */
  async parse(cid, content, instanceID) {
    if (await validateCID(cid.rawValue, content)) {
      return parse(cid, content, instanceID);
    }
  },
} satisfies ContentIdentifierScheme<File>;
