import { File } from '../file/file.js';
import type { ContentIdentifierScheme } from '../identifiers/identifiers.js';

/**
 * A parse handler for {@linkcode ContentIdentifierScheme}s, such as `Immutable` and `Mutable`, that
 * deal with {@linkcode File}s.
 *
 * @param _ The content identifier (unused).
 * @param content The content buffer.
 * @param instanceID The instance for codec resolution.
 * @returns The parsed {@linkcode File}.
 * @throws If the parsing and handoff to the middleware and codec systems fail, that error is
 *   thrown.
 * @internal
 */
export const parse: ContentIdentifierScheme<File>['parse'] = async (_, content, instanceID) => {
  const file = new File(content);
  await file.getValue(instanceID); // validate
  return file;
};
