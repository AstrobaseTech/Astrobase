import type { Hash } from './hash.js';

/**
 * A valid hash value that includes the algorithm identifier prefix. This can be one of:
 *
 * - An `ArrayLike` of byte values.
 * - An `ArrayBufferLike`.
 * - A {@link Hash} instance.
 */
export type HashLike = ArrayLike<number> | ArrayBufferLike | Hash;

/**
 * A hash function implementation.
 *
 * @param payload The payload to perform the hash algorithm on.
 * @returns A promise that resolves with the output digest.
 */
export type HashFn = (payload: BufferSource) => Promise<ArrayBuffer>;
