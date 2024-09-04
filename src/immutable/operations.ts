import { File } from '../file/file.js';
import { Identifier, deleteOne, getOne, putOne } from '../identifiers/identifiers.js';
import { cidToBytes, type CIDLike } from './cid.js';
import { Hash, HashAlgorithm, hash } from './hashes.js';
import { Immutable } from './schema.js';

/**
 * Sends a request to delete an item of immutable data to all registered channels asynchronously.
 *
 * @param cid A {@linkcode CIDLike} value of the ID of the item to delete.
 * @param instanceID The instance to delete from.
 * @returns A promise that resolves when all requests have completed.
 */
export async function deleteImmutable(cid: CIDLike, instanceID?: string) {
  return deleteOne(new Identifier(Immutable.key, cidToBytes(cid)), instanceID);
}

/**
 * Queries registered channels to retrieve an item of immutable data. If all channels are queried
 * with no successful result, returns `void`.
 *
 * @template T The type of the item's content after successful decoding.
 * @param cid A {@linkcode CIDLike} value of the ID of the item to retrieve.
 * @param instanceID The instance to retrieve from.
 * @returns A promise that resolves with the value of the item, or `void` if no valid value was
 *   retrieved.
 */
export async function getImmutable<T = unknown>(cid: CIDLike, instanceID?: string) {
  return getOne<T>(new Identifier(Immutable.key, cidToBytes(cid)), instanceID);
}

/** Additional options for `putImmutable`. */
export interface PutOptions {
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
  /** The instance to save the item under. */
  instanceID?: string;
}

/**
 * Sends a request to save an item of immutable data to all registered channels asynchronously.
 *
 * @param file A {@linkcode File} instance to save.
 * @param options Additional {@linkcode PutOptions}.
 * @returns A promise that resolves with the immutable content {@linkcode Hash}.
 */
export async function putImmutable(file: File, options?: PutOptions): Promise<Hash> {
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, file.buffer);
  const cid = new Identifier(Immutable.key, objectHash.toBytes());
  await putOne(cid, file.buffer, options?.instanceID);
  return objectHash;
}
