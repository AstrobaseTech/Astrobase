import { ContentIdentifier } from '../cid/cid.js';
// prettier-ignore
import { deleteContent, getContent, putContent, type PutOptions } from '../content/api.js';
import { FileBuilder } from '../file/file-builder.js';
import { hash, hashToBytes, SHA_256, type HashLike } from '../hashing/index.js';
import type { Instance } from '../instance/instance.js';

/** The content identifier prefix for the immutable content scheme. */
export const IMMUTABLE_PREFIX = '$ref';

/**
 * Coerces an immutable content hash into a {@link ContentIdentifier} for the immutable content
 * scheme.
 */
export const toImmutableCID = (hash: HashLike) =>
  new ContentIdentifier(IMMUTABLE_PREFIX, hashToBytes(hash));

/**
 * Asynchronously requests each client of the instance to delete an item of immutable content by its
 * content hash.
 *
 * @param instance The instance to request a delete.
 * @param hash A valid {@link HashLike} of the File to delete.
 * @returns A promise that resolves when all requests have settled.
 */
export const deleteImmutable = (instance: Instance, hash: HashLike) =>
  deleteContent(toImmutableCID(hash), instance);

/**
 * Queries clients of the instance to retrieve an immutable File by its content hash. This function
 * extends {@link getContent}.
 *
 * @template T The type of the File content after successful decoding.
 * @param instance The instance to query.
 * @param hash The hash of the desired File.
 * @returns A promise that resolves with the File if successful or `void` if nothing valid was
 *   retrieved.
 */
export const getImmutable = <T>(instance: Instance, hash: HashLike) =>
  getContent<FileBuilder<T>>(toImmutableCID(hash), instance);

/** Additional options for {@link putImmutable}. */
export interface ImmutablePutOptions extends PutOptions {
  /** The hashing algorithm to use. */
  hashAlg?: number;
}

/**
 * Asynchronously pushes an immutable File to each client of the instance. This function extends
 * {@link putContent} and handles content hash generation.
 *
 * @param file The file to push.
 * @param options The put request options.
 * @returns A promise that resolves with the Content Identifier after all requests have settled.
 */
export async function putImmutable(file: FileBuilder, options: ImmutablePutOptions) {
  const hashAlg = options.hashAlg ?? SHA_256;
  const cid = toImmutableCID(await hash(options.instance, hashAlg, file.buffer));
  await putContent(cid, file.buffer, options);
  return cid;
}
