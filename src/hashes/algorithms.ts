import type { HashFn } from './types.js';

/** Hashing algorithms supported by the SDK by default. */
export enum HashAlgorithm {
  /** Type code for SHA-256. */
  SHA256 = 0,
}

/**
 * Performs an iteration of SHA-256 on a buffer.
 *
 * @param payload The buffer.
 * @returns A promise that resolves with the SHA-256 output.
 */
export const sha256: HashFn = (payload) => crypto.subtle.digest('SHA-256', payload);
