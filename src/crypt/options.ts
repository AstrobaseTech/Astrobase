import { CRYPT_DEFAULTS } from './defaults.js';

/** Options for the crypt API. */
export interface CryptOptions {
  /** The encryption algorithm. */
  encAlg: string;

  /** The hashing algorithm used for key derivation. */
  hashAlg: 'SHA-256';

  /** The number of iterations for key derivation. */
  iterations: number;

  /** Nonce or initialization vector. */
  nonce: Uint8Array<ArrayBuffer>;

  /** The key derivation function identifier. */
  kdf: 'PBKDF2';

  /** A passphrase to use for key derivation. */
  passphrase?: string;

  /**
   * The public key of the key pair to use for key derivation.
   *
   * Note that the public key is merely used to lookup the corresponding private key via the
   * keyring. A symmetric key is ultimately derived from the private key.
   */
  pubKey?: Uint8Array;

  /** The key derivation salt. */
  salt: Uint8Array<ArrayBuffer>;
}

/**
 * Builds a full options object from the given options partial. Populates omitted properties with
 * defaults.
 *
 * If any of `encAlg`, `hashAlg`, `iterations`, or `kdf` are not provided, its value from
 * {@link CRYPT_DEFAULTS} will be used.
 *
 * If `iv` is not provided, 12 random bytes will be generated.
 *
 * If `salt` is not provided, 16 random bytes will be generated.
 *
 * `crypto.getRandomValues` is used to generate random bytes.
 *
 * @param partialOptions An options partial.
 * @returns A full {@link CryptOptions} object.
 */
export const cryptOptions = (partialOptions: Partial<CryptOptions>): CryptOptions => ({
  encAlg: partialOptions.encAlg ?? CRYPT_DEFAULTS.encAlg,
  hashAlg: partialOptions.hashAlg ?? CRYPT_DEFAULTS.hashAlg,
  iterations: partialOptions.iterations ?? CRYPT_DEFAULTS.iterations,
  nonce: partialOptions.nonce ?? crypto.getRandomValues(new Uint8Array(12)),
  kdf: partialOptions.kdf ?? CRYPT_DEFAULTS.kdf,
  passphrase: partialOptions.passphrase,
  pubKey: partialOptions.pubKey,
  salt: partialOptions.salt ?? crypto.getRandomValues(new Uint8Array(16)),
});

/**
 * @param options The {@link CryptOptions} object to sanitize.
 * @returns A sanitized version of the given {@link CryptOptions} with sensitive data removed. The
 *   original object remains unmodified.
 */
export function sanitizeCryptOptions<T extends CryptOptions>(options: T): Omit<T, 'passphrase'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passphrase, ...sanitized } = options;
  return sanitized;
}
