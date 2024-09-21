import { File } from '../file/file.js';
import { hash, HashAlgorithm, hashToBytes, type HashLike } from '../hashes/index.js';
import { ContentIdentifier } from '../identifiers/identifiers.js';
import {
  deleteContent,
  getContent,
  putContent,
  type PutOptions,
} from '../repository/repository.js';

/**
 * Coerces a {@linkcode HashLike} value into a {@linkcode ContentIdentifier} instance for the
 * immutable scheme.
 *
 * @param hash The {@linkcode HashLike} value.
 * @returns The {@linkcode ContentIdentifier} instance.
 */
export const toImmutableCID = (hash: HashLike) => new ContentIdentifier([1, ...hashToBytes(hash)]);

/**
 * Sends a request, to all registered channels asynchronously, to delete an item of immutable
 * content.
 *
 * @param hash A valid {@linkcode HashLike} of the {@linkcode File} to delete.
 * @param instanceID The instance to delete from.
 * @returns A promise that resolves when all requests have completed.
 */
export function deleteImmutable(hash: HashLike, instanceID?: string) {
  return deleteContent(toImmutableCID(hash), instanceID);
}

/**
 * Queries registered channels to retrieve an immutable {@linkcode File}. If all channels are queried
 * with no successful result, returns `void`.
 *
 * @template T The type of the {@linkcode File} content after successful decoding.
 * @param hash A valid {@linkcode HashLike} of the {@linkcode File} to retrieve.
 * @param instanceID The instance to retrieve from.
 * @returns A promise that resolves with the decoded content, or `void` if nothing valid was
 *   retrieved.
 */
export function getImmutable<T>(hash: HashLike, instanceID?: string) {
  return getContent<File<T>>(toImmutableCID(hash), instanceID);
}

/** Additional options for `putImmutable`. */
export interface ImmutablePutOptions extends PutOptions {
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
}

/**
 * Sends a request, to all registered channels asynchronously, to save an item of immutable content.
 *
 * @param file A {@linkcode File} instance to save.
 * @param options Additional {@linkcode ImmutablePutOptions}.
 * @returns A promise that resolves with the {@linkcode ContentIdentifier}.
 */
export async function putImmutable(file: File, options?: ImmutablePutOptions) {
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const cid = toImmutableCID(await hash(hashAlg, file.buffer));
  await putContent(cid, file.buffer, options);
  return cid;
}
