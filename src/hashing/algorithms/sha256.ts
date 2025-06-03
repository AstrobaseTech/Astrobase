import type { HashFn } from '../types.js';

/** The algorithm identifier for SHA-256. */
export const SHA_256 = 0;

/**
 * Performs an iteration of SHA-256 on a buffer using the WebCrypto API.
 *
 * @param payload The buffer.
 * @returns A promise that resolves with the SHA-256 output.
 */
export const sha256: HashFn = (payload) => crypto.subtle.digest('SHA-256', payload);
