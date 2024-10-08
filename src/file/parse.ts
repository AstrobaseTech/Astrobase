import { File } from '../file/file.js';
import type { ContentIdentifierSchemeParser } from '../identifiers/identifiers.js';

/**
 * A parse handler for {@linkcode ContentIdentifierSchemeParser}s, such as `Immutable` and `Mutable`,
 * that deal with {@linkcode File}s.
 *
 * @param _ The content identifier (unused).
 * @param content The content buffer.
 * @param instanceID The instance for codec resolution.
 * @returns The parsed {@linkcode File}.
 * @throws If the parsing and handoff to the middleware and codec systems fail, that error is
 *   thrown.
 * @internal
 */
export const parse: ContentIdentifierSchemeParser<File> = async (_, content, instanceID) => {
  const file = new File(content);
  await file.getValue(instanceID); // validate
  return file;
};
