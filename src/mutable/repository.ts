import { File } from '../file/file.js';
import { deleteOne, getOne, putOne } from '../identifiers/identifiers.js';
import { Mutable } from './scheme.js';

const encoder = new TextEncoder();

/**
 * Converts an arbitrary key string to a mutable content identifier byte array.
 *
 * @param key A key string.
 * @returns The mutable content identifier byte array.
 * @experimental
 */
export const keyToCID = (key: string) => [Mutable.key, ...encoder.encode(key)];

/**
 * Sends a request, to all registered channels asynchronously, to delete an item of mutable content.
 *
 * @param key The key string. Unlike other content identifiers, any regular UTF-8 string is
 *   supported.
 * @param instanceID The instance to delete from.
 * @returns A promise that resolves when all requests have completed.
 * @experimental
 */
export function deleteMutable(key: string, instanceID?: string) {
  return deleteOne(keyToCID(key), instanceID);
}

/**
 * Queries registered channels to retrieve an item of mutable content. If all channels are queried
 * with no successful result, returns `void`.
 *
 * @template T The type of the content after successful decoding.
 * @param key The key string. Unlike other content identifiers, any regular UTF-8 string is
 *   supported.
 * @param instanceID The instance to retrieve from.
 * @returns A promise that resolves with the decoded content, or `void` if nothing valid was
 *   retrieved.
 * @experimental
 */
export function getMutable<T>(key: string, instanceID?: string) {
  return getOne<File<T>>(keyToCID(key), instanceID);
}

/**
 * Sends a request, to all registered channels asynchronously, to save an item of mutable content.
 *
 * @template T The type of the {@linkcode File}.
 * @param key The key string. Unlike other content identifiers, any regular UTF-8 string is
 *   supported.
 * @param file A {@linkcode File} instance to save.
 * @returns A promise that resolves when all requests have completed.
 * @experimental
 */
export function putMutable<T>(key: string, file: File<T>, instanceID?: string) {
  return putOne(keyToCID(key), file.buffer, instanceID);
}
