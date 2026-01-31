import { getPrivateKey, type GetPrivateKeyOptions } from '../identity/identity.js';
import { getOrThrow, type Instance } from '../instance/instance.js';
import type { MaybePromise } from '../internal/maybe-promise.js';

export interface KeyDerivationOptions extends Partial<GetPrivateKeyOptions> {
  /** The encryption algorithm. */
  encAlg: string;

  /** The hashing algorithm used for key derivation. */
  hashAlg: string;

  /** The instance configuration. */
  instance: Instance;

  /** The number of iterations for key derivation. */
  iterations: number;

  /** The key derivation function identifier. */
  kdf: string;

  /** The desired derived key length in bytes. */
  keyLen: number;

  /** A passphrase to use for key derivation. */
  passphrase?: string;

  /**
   * The public key of the key pair to use for key derivation. The key pair must be accessible via
   * the instance's active keyring.
   *
   * Note that the public key is merely used to lookup the corresponding private key. A symmetric
   * key is ultimately derived from the private key.
   */
  publicKey?: Uint8Array<ArrayBuffer>;

  /** The key derivation salt. */
  salt: Uint8Array<ArrayBuffer>;
}

/**
 * Derives a symmetric encryption key using the given options. Requires a key derivation input to be
 * provided - one of {@link CryptOptions.passphrase} or {@link CryptOptions.publicKey}. If `publickey`
 * is provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation fails.
 *
 * @param options The key derivation options.
 * @returns The derived key bytes as a promise.
 */
export async function deriveKey({
  lookaheadLimit,
  passphrase,
  publicKey,
  ...options
}: KeyDerivationOptions) {
  let input;

  if (passphrase) {
    if (publicKey) {
      throw new TypeError('Ambiguous key derivation input');
    }
    input = new TextEncoder().encode(passphrase);
  } else if (publicKey) {
    input = getPrivateKey({
      instance: options.instance,
      lookaheadLimit,
      publicKey,
    });
  } else {
    throw new TypeError('Missing key derivation input');
  }

  return await getOrThrow(options.instance, 'kdf', options.kdf)({ input, ...options });
}

export interface KeyDerivationContext extends Omit<
  KeyDerivationOptions,
  'lookaheadLimit' | 'passphrase' | 'publicKey'
> {
  /** The key derivation input material. */
  input: Uint8Array<ArrayBuffer>;
}

export type KeyDerivationFn = (
  options: KeyDerivationContext,
) => MaybePromise<Uint8Array<ArrayBuffer>>;
