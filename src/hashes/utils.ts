import { identifierToBytes, payloadToBytes } from '../internal/encoding.js';
import { Hash } from './hash.js';
import { HashFnRegistry } from './registry.js';
import type { HashLike } from './types.js';

/**
 * Coerces a {@linkcode HashLike} value to `Uint8Array`.
 *
 * @param hash The {@linkcode HashLike} value.
 * @returns The `Uint8Array`.
 */
export function hashToBytes(hash: HashLike) {
  return hash instanceof Hash ? hash.bytes : identifierToBytes(hash);
}

/**
 * Checks whether or not a hash matches the content.
 *
 * @param testHash A {@linkcode HashLike} value.
 * @param content Either an array of byte values, an `ArrayBufferLike`, or a base64 encoded string.
 * @returns A promise that resolves with a boolean indicating whether or not the hash and content
 *   match.
 */
export async function validateHash(
  testHash: HashLike,
  content: ArrayLike<number> | ArrayBufferLike | string,
) {
  testHash = new Hash(testHash);

  const calculatedHash = await hash(testHash.algorithm.value, payloadToBytes(content));
  const length = calculatedHash.value.length;

  if (length !== testHash.value.length) {
    return false;
  }

  for (let i = 0; i < length; i++) {
    if (calculatedHash.value[i] !== testHash.value[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Performs the hashing algorithm on the given buffer.
 *
 * @param alg The the type code of the hashing algorithm to use.
 * @param payload The buffer to perform hashing on.
 * @param instanceID The instance for algorithm resolution.
 * @returns A promise that resolves with the {@linkcode Hash} output.
 */
export async function hash(alg: number, payload: BufferSource, instanceID?: string) {
  const fn = HashFnRegistry.getStrict(alg, instanceID);
  return new Hash([alg, ...new Uint8Array(await fn(payload))]);
}
