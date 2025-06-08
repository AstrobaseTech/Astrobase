/** @module Mutable */

import { ContentIdentifier } from '../cid/cid.js';
// prettier-ignore
import { deleteContent, getContent, putContent, type PutOptions } from '../content/api.js';
import { FileBuilder } from '../file/file-builder.js';
import type { Instance } from '../instance/instance.js';

/** The content identifier prefix for the mutable content scheme. */
export const MUTABLE_PREFIX = '$mut';

/**
 * Deterministically creates a Content Identifier for the mutable content scheme from an arbitrary
 * key string.
 */
export const keyToCID = (key: string) =>
  new ContentIdentifier(MUTABLE_PREFIX, new TextEncoder().encode(key));

/**
 * Sends a request to delete an item of mutable content to all clients asynchronously.
 *
 * @param key The key string.
 * @param instance The {@link Instance} config.
 * @returns A promise that resolves when all requests have completed.
 * @experimental
 */
export function deleteMutable(key: string, instance: Instance) {
  return deleteContent(keyToCID(key), instance);
}

/**
 * Queries clients to retrieve an item of mutable content. If all clients are queried with no
 * successful result, returns `void`.
 *
 * @template T The type of the content after successful decoding.
 * @param key The key string.
 * @param instance The {@link Instance} config.
 * @returns A promise that resolves with the decoded content, or `void` if nothing valid was
 *   retrieved.
 * @experimental
 */
export function getMutable<T>(key: string, instance: Instance) {
  return getContent<FileBuilder<T>>(keyToCID(key), instance);
}

/**
 * Sends a request to save an item of mutable content to all clients asynchronously.
 *
 * @template T The type of the {@link FileBuilder}.
 * @param key The key string.
 * @param file A {@link FileBuilder} instance to save.
 * @param options Additional {@link PutOptions}.
 * @returns A promise that resolves when all requests have completed.
 * @experimental
 */
export function putMutable<T>(key: string, file: FileBuilder<T>, options: PutOptions) {
  return putContent(keyToCID(key), file.buffer, options);
}
