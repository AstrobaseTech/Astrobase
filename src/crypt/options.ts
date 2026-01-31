import type { KeyDerivationOptions } from '../kdf/kdf.js';
import { CRYPT_DEFAULTS } from './defaults.js';

/** Options for the crypt API. */
export interface CryptOptions extends Omit<KeyDerivationOptions, 'instance'> {
  /** Nonce or initialization vector. */
  nonce: Uint8Array<ArrayBuffer>;
}

/**
 * Builds a full options object from the given options partial. Populates omitted properties with
 * defaults.
 *
 * If any of `encAlg`, `hashAlg`, `iterations`, `kdf`, or `keyLen` are not provided, its value from
 * {@link CRYPT_DEFAULTS} will be used.
 *
 * If `nonce` is not provided, 12 random bytes will be generated.
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
  kdf: partialOptions.kdf ?? CRYPT_DEFAULTS.kdf,
  keyLen: partialOptions.keyLen ?? CRYPT_DEFAULTS.keyLen,
  nonce: partialOptions.nonce ?? crypto.getRandomValues(new Uint8Array(12)),
  passphrase: partialOptions.passphrase,
  publicKey: partialOptions.publicKey,
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
