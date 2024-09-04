import { Base58 } from '../internal/encoding.js';

/**
 * Hashing algorithms available to the SDK.
 *
 * TODO: Replace with a Registry.
 */
export enum HashAlgorithm {
  /** Type code for SHA-256. */
  SHA256 = 0,
}

/** TODO: Make like other encoding classes. */
export class Hash {
  constructor(
    /** The hash algorithm identifier byte of the hash. */
    readonly algorithm: HashAlgorithm,
    /** The hash bytes, minus the first algorithm identifier byte. */
    readonly value: Uint8Array,
  ) {}

  /**
   * Returns the full hash bytes, including the first algorithm identifier byte, as a new
   * `Uint8Array`.
   */
  toBytes() {
    return new Uint8Array([this.algorithm, ...this.value]);
  }

  /** Returns the hash encoded into base58. */
  toBase58(): string {
    return Base58.encode(this.toBytes());
  }

  /** Returns the hash encoded into base58. */
  toString(): string {
    return this.toBase58();
  }
}

/**
 * Performs the hashing algorithm on the given buffer.
 *
 * @param alg The the type code of the hashing algorithm to use.
 * @param payload The buffer to perform hashing on.
 * @returns A promise that resolves with the {@linkcode Hash} output.
 */
export async function hash(alg: HashAlgorithm, payload: BufferSource): Promise<Hash> {
  switch (alg) {
    case HashAlgorithm.SHA256:
      return new Hash(alg, new Uint8Array(await sha256(payload)));
    default:
      throw new TypeError('Unsupported algorithm');
  }
}

/**
 * Performs an iteration of SHA-256 on the given buffer.
 *
 * @param payload The buffer to perform hashing on.
 * @returns A promise that resolves with the hash buffer.
 */
export function sha256(payload: BufferSource) {
  return crypto.subtle.digest('SHA-256', payload);
}
