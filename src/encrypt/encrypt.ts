import { getPrivateKey } from '../identity/identity.js';
import type { Instance } from '../instance/instance.js';

/** Options for encrypt API. */
export interface EncryptOptions {
  /** The encryption algorithm. */
  encAlg: 'AES-GCM';

  /** The hashing algorithm used for key derivation. */
  hashAlg: 'SHA-256';

  /** The number of iterations for key derivation. */
  iterations: number;

  /** Nonce or initialization vector. */
  nonce: Uint8Array;

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
  salt: Uint8Array;
}

/**
 * The default {@link EncryptOptions} for new encryptions.
 *
 * Note that these will certainly change in the future and cannot be relied upon for future
 * decryption. Therefore, the options should always be stored alongside the payload even when
 * defaults are used.
 */
export const DEFAULTS = {
  /** The default cipher used for new encryptions. */
  encAlg: 'AES-GCM',
  /** The default hash algorithm used for KDF for new encryptions. */
  hashAlg: 'SHA-256',
  /** The default KDF iterations for new encryptions. */
  iterations: 100000,
  /** The default KDF algorithm used for new encryptions. */
  kdf: 'PBKDF2',
} as const satisfies Partial<EncryptOptions>;

/**
 * Builds a full options object from the given options partial. Populates omitted properties with
 * defaults.
 *
 * If any of `encAlg`, `hashAlg`, `iterations`, or `kdf` are not provided, its value from
 * {@link DEFAULTS} will be used.
 *
 * If `iv` is not provided, 12 random bytes will be generated.
 *
 * If `salt` is not provided, 16 random bytes will be generated.
 *
 * `crypto.getRandomValues` is used to generate random bytes.
 *
 * @param partialOptions An options partial.
 * @returns A full {@link EncryptOptions} object.
 */
export const buildFullOptions = (partialOptions: Partial<EncryptOptions>): EncryptOptions => ({
  encAlg: partialOptions.encAlg ?? DEFAULTS.encAlg,
  hashAlg: partialOptions.hashAlg ?? DEFAULTS.hashAlg,
  iterations: partialOptions.iterations ?? DEFAULTS.iterations,
  nonce: partialOptions.nonce ?? crypto.getRandomValues(new Uint8Array(12)),
  kdf: partialOptions.kdf ?? DEFAULTS.kdf,
  passphrase: partialOptions.passphrase,
  pubKey: partialOptions.pubKey,
  salt: partialOptions.salt ?? crypto.getRandomValues(new Uint8Array(16)),
});

/**
 * @param options The options object to sanitize.
 * @returns A sanitized version of the given {@link EncryptOptions} with sensitive data removed.
 */
export function sanitizeOptions<T extends EncryptOptions>(options: T): Omit<T, 'passphrase'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passphrase, ...sanitized } = options;
  return sanitized;
}

/**
 * Derives a symmetric encryption key using the given options. Requires a key derivation input to be
 * provided - one of {@link EncryptOptions.passphrase} or {@link EncryptOptions.pubKey}. If `pubkey`
 * is provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation fails.
 *
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @param options The full options to be used.
 * @returns The derived crypto key as a promise.
 */
export async function deriveKey(instance: Instance, options: EncryptOptions) {
  let kdInput: BufferSource;

  if (options.passphrase) {
    kdInput = new TextEncoder().encode(options.passphrase);
  } else if (options.pubKey) {
    kdInput = getPrivateKey({ instance, publicKey: options.pubKey });
  } else {
    throw new TypeError('No key derivation input was provided');
  }

  return crypto.subtle.deriveKey(
    {
      name: options.kdf,
      hash: options.hashAlg,
      iterations: options.iterations,
      salt: options.salt,
    },
    await crypto.subtle.importKey('raw', kdInput, options.kdf, false, ['deriveKey']),
    { name: options.encAlg, length: 256 },
    false,
    ['decrypt', 'encrypt'],
  );
}

/**
 * Decrypts the payload using the given options. Requires a key derivation input to be provided -
 * one of {@link EncryptOptions.passphrase} or {@link EncryptOptions.pubKey}. If `pubkey` is provided,
 * then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation or decryption
 * fails.
 *
 * @param payload The payload to decrypt.
 * @param options The full options object.
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @returns The decrypted payload as a promise.
 */
export const decrypt = async (payload: BufferSource, options: EncryptOptions, instance: Instance) =>
  crypto.subtle.decrypt(
    { name: options.encAlg, iv: options.nonce },
    await deriveKey(instance, options),
    payload,
  );

/**
 * Encrypts the payload using the given options. Requires a key derivation input to be provided -
 * one of {@link EncryptOptions.passphrase} or {@link EncryptOptions.pubKey}. If `pubkey` is provided,
 * then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation or encryption
 * fails.
 *
 * @param payload The payload to decrypt.
 * @param options The full options object.
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @returns The encrypted payload as a promise.
 */
export const encrypt = async (payload: BufferSource, options: EncryptOptions, instance: Instance) =>
  crypto.subtle.encrypt(
    { name: options.encAlg, iv: options.nonce },
    await deriveKey(instance, options),
    payload,
  );
