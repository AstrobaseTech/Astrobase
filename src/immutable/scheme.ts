import type { ContentIdentifierSchemeParser } from '../cid/cid.js';
import type { FileBuilder } from '../file/file-builder.js';
import { parseAsFile } from '../file/parse.js';
import { validateHash } from '../hashing/utils.js';

/**
 * Handles parsing for the immutable content identifier scheme. Wraps the parse handler provided by
 * the File module and additionally validates the hash within the content identifier.
 */
export const Immutable = (async (cid, content, instance) => {
  if (await validateHash(instance, cid.value, content)) {
    return parseAsFile(cid, content, instance);
  }
}) satisfies ContentIdentifierSchemeParser<FileBuilder>;
