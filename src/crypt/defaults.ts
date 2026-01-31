import type { CryptOptions } from './options.js';

/**
 * The default {@link CryptOptions} for new encryptions.
 *
 * Note that these will certainly change in the future and cannot be relied upon for future
 * decryption. Therefore, the options should always be stored alongside the payload even when
 * defaults are used.
 */
export const CRYPT_DEFAULTS = {
  /** The default cipher used for new encryptions. */
  encAlg: 'AES-GCM',

  /** The default hash algorithm used for KDF for new encryptions. */
  hashAlg: 'SHA-256',

  /** The default KDF iterations for new encryptions. */
  iterations: 100000,

  /** The default derived key length for new encryptions. */
  keyLen: 32,

  /** The default KDF algorithm used for new encryptions. */
  kdf: 'PBKDF2',
} as const satisfies Partial<CryptOptions>;
