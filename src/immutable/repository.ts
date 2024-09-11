import { File } from '../file/file.js';
import { ContentIdentifier, deleteOne, getOne, putOne } from '../identifiers/identifiers.js';
import { cidToBytes, type CIDLike } from './cid.js';
import { HashAlgorithm, hash } from './hashes.js';
import { Immutable } from './scheme.js';

/**
 * Sends a request, to all registered channels asynchronously, to delete an item of immutable
 * content.
 *
 * @param cid A valid {@linkcode CIDLike} of the {@linkcode File} to delete.
 * @param instanceID The instance to delete from.
 * @returns A promise that resolves when all requests have completed.
 */
export async function deleteImmutable(cid: CIDLike, instanceID?: string) {
  return deleteOne(new ContentIdentifier([Immutable.key, ...cidToBytes(cid)]), instanceID);
}

/** @deprecated In future it will be required to provide a `T` type param. */
export async function getImmutable(cid: CIDLike, instanceID?: string): Promise<File<unknown>>;
export async function getImmutable<T>(cid: CIDLike, instanceID?: string): Promise<File<T>>;
/**
 * Queries registered channels to retrieve an immutable {@linkcode File}. If all channels are queried
 * with no successful result, returns `void`.
 *
 * @template T The type of the {@linkcode File} content after successful decoding.
 * @param cid A valid {@linkcode CIDLike} of the {@linkcode File} to retrieve.
 * @param instanceID The instance to retrieve from.
 * @returns A promise that resolves with the decoded content, or `void` if nothing valid was
 *   retrieved.
 */
export async function getImmutable<T = unknown>(cid: CIDLike, instanceID?: string) {
  return getOne<File<T>>(new ContentIdentifier([Immutable.key, ...cidToBytes(cid)]), instanceID);
}

/** Additional options for `putImmutable`. */
export interface PutOptions {
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
  /** The instance to save the item under. */
  instanceID?: string;
}

/**
 * Sends a request, to all registered channels asynchronously, to save an item of immutable content.
 *
 * @param file A {@linkcode File} instance to save.
 * @param options Additional {@linkcode PutOptions}.
 * @returns A promise that resolves with the {@linkcode ContentIdentifier}.
 */
export async function putImmutable(file: File, options?: PutOptions) {
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, file.buffer);
  const cid = new ContentIdentifier([Immutable.key, ...objectHash.bytes]);
  await putOne(cid, file.buffer, options?.instanceID);
  return cid;
}
