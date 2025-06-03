import type { ContentIdentifierSchemeParser } from '../cid/cid.js';
import { FileBuilder } from './file-builder.js';

/**
 * Used to parse and validate content as files by the `Immutable` and `Mutable` content identifier
 * schemes.
 *
 * @param _ The content identifier (unused).
 * @param content The content buffer.
 * @param instanceID The instance for codec resolution.
 * @returns The parsed file as a {@link FileBuilder} object.
 * @throws If the parsing and handoff to the middleware and codec systems fail, that error is
 *   thrown.
 * @internal
 */
export const parseAsFile: ContentIdentifierSchemeParser<FileBuilder> = async (
  _,
  content,
  instanceID,
) => {
  const file = new FileBuilder(content);
  await file.getValue(instanceID); // validate
  return file;
};
