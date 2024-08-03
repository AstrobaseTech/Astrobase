import type { MediaType } from 'content-type';
import { FileBuilder } from '../file/file.js';
import { encodeMediaType, validateMediaType } from '../file/media-types.js';
import { Identifier, deleteOne, getOne, putOne } from '../identifiers/identifiers.js';
import { cidToBytes, type CIDLike } from './cid.js';
import { encodeWithCodec } from './codecs.js';
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

/** @deprecated A new File API is under construction */
export interface SerializeContentOptions {
  /**
   * Set to true to use a encoded payload. When this option is enabled, the value must be a
   * `Uint8Array`.
   *
   * @default false
   */
  encoded?: boolean;
  instanceID?: string;
  /**
   * Set to true to trust the parameter values and skip any validation.
   *
   * @default false
   */
  trust?: boolean;
}

/** @deprecated A new File API is under construction */
export async function serializeFileContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: SerializeContentOptions & { encoded?: false },
): Promise<Uint8Array>;
export async function serializeFileContent(
  payload: Uint8Array,
  mediaType: string | MediaType,
  options: SerializeContentOptions & { encoded: true },
): Promise<Uint8Array>;
export async function serializeFileContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: SerializeContentOptions,
): Promise<Uint8Array> {
  let encodedPayload: Uint8Array;

  if (options?.encoded) {
    if (!(value instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array');
    }
    encodedPayload = value;
  } else {
    encodedPayload = await encodeWithCodec(value, mediaType, options?.instanceID);
  }

  const mediaTypeBytes = encodeMediaType(mediaType);

  if (!options?.trust && !validateMediaType(mediaTypeBytes)) {
    throw new Error('Bad media type');
  }

  return new Uint8Array([1, ...mediaTypeBytes, 0, ...encodedPayload]);
}

export function fileVersionIsSupported(version: number): boolean {
  return version === 1;
}
