import { getOrThrow, type Instance } from '../instance/instance.js';
import { compareBytes, payloadToBytes } from '../internal/encoding.js';
import { Hash } from './hash.js';
import type { HashLike } from './types.js';

/**
 * Coerces a {@link HashLike} value to `Uint8Array`.
 *
 * @param hash The {@link HashLike} value.
 * @returns The `Uint8Array`.
 */
export function hashToBytes(hash: HashLike) {
  return hash instanceof Hash ? hash.bytes : new Uint8Array(hash);
}

/**
 * Checks whether or not a hash matches the content.
 *
 * @param testHash A {@link HashLike} value.
 * @param content Either an array of byte values, an `ArrayBufferLike`, or a base64 encoded string.
 * @returns A promise that resolves with a boolean indicating whether or not the hash and content
 *   match.
 */
export async function validateHash(
  instance: Instance,
  testHash: HashLike,
  content: ArrayLike<number> | ArrayBuffer | string,
) {
  testHash = new Hash(testHash);
  return compareBytes(
    new Hash(testHash).value,
    (await hash(instance, testHash.algorithm.value, payloadToBytes(content))).value,
  );
}

/**
 * Performs the hashing algorithm on the given buffer.
 *
 * @param instance The instance for algorithm resolution.
 * @param alg The the type code of the hashing algorithm to use.
 * @param payload The buffer to perform hashing on.
 * @returns A promise that resolves with the {@link Hash} output.
 */
export const hash = async (instance: Instance, alg: number, payload: BufferSource) =>
  new Hash([alg, ...new Uint8Array(await getOrThrow(instance, 'hashAlgs', alg)(payload))]);
