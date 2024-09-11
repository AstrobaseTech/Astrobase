import type { File } from '../file/file.js';
import { parse } from '../file/parse.js';
import type { ContentIdentifierScheme } from '../identifiers/identifiers.js';

/**
 * The {@linkcode ContentIdentifierScheme} for mutable, arbitrarily addressed files. The scheme is
 * automatically registered globally.
 *
 * @experimental
 */
export const Mutable = {
  /** Immutable data uses the content identifier type `2`. */
  key: 2 as const,

  /**
   * The parse handler for the {@linkcode Mutable} {@linkcode ContentIdentifierScheme}. This scheme
   * uses the parse handler provided by the File module.
   *
   * @param cid A mutable content identifier.
   * @param content The content buffer.
   * @param instanceID The instance for codec resolution.
   * @returns The parsed {@linkcode File}.
   * @throws If the parsing and handoff to the middleware and codec systems fail, that error is
   *   thrown.
   */
  parse,
} satisfies ContentIdentifierScheme<File>;
