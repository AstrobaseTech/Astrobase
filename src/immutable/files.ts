import { FileBuilder } from '../file/file.js';
import { Identifier, deleteOne, getOne, putOne } from '../identifiers/identifiers.js';
import { cidToBytes, type CIDLike } from './cid.js';
import { Hash, HashAlgorithm, hash } from './hashes.js';
import { Immutable } from './schema.js';

export async function deleteImmutable(cid: CIDLike, instanceID?: string) {
  return deleteOne(new Identifier(Immutable.key, cidToBytes(cid)), instanceID);
}

export async function getImmutable<T = unknown>(cid: CIDLike, instanceID?: string) {
  return getOne<T>(new Identifier(Immutable.key, cidToBytes(cid)), instanceID);
}

export interface PutOptions {
  hashAlg?: HashAlgorithm;
  instanceID?: string;
}

export async function putImmutable(file: FileBuilder, options?: PutOptions): Promise<Hash> {
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, file.buffer);
  const cid = new Identifier(Immutable.key, objectHash.toBytes());
  await putOne(cid, file.buffer, options?.instanceID);
  return objectHash;
}
