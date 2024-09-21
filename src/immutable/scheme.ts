import type { File } from '../file/file.js';
import { parse } from '../file/parse.js';
import { validateHash } from '../hashes/utils.js';
import type { ContentIdentifierSchemeParser } from '../identifiers/identifiers.js';

/**
 * Handles parsing for the immutable content identifier scheme. Wraps the parse handler provided by
 * the File module and additionally validates the hash within the content identifier.
 */
export const Immutable: ContentIdentifierSchemeParser<File> = async (cid, content, instanceID) => {
  if (await validateHash(cid.rawValue, content)) {
    return parse(cid, content, instanceID);
  }
};
