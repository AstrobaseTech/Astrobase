import { getPrivateKey } from '../identity/identity.js';
import type { Instance } from '../instance/instance.js';
import type { CryptOptions } from './options.js';
import { deriveWebCryptoKey } from './web-crypto.js';

/**
 * Prepares the key derivation input from the {@link CryptOptions}. Requires a key derivation input
 * to be provided - one of {@link CryptOptions.passphrase} or {@link CryptOptions.pubKey}. If `pubkey`
 * is provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no or ambiguous key derivation input is provided or if key derivation
 * fails.
 *
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @param options Key derivation input options.
 * @returns The key derivation input buffer.
 */
export function prepareKeyDerivationInput(
  instance: Instance,
  options: Pick<CryptOptions, 'passphrase' | 'pubKey'>,
) {
  if (options.passphrase) {
    if (options.pubKey) {
      throw new TypeError('Ambiguous key derivation input');
    }
    return new TextEncoder().encode(options.passphrase);
  } else if (options.pubKey) {
    return getPrivateKey({ instance, publicKey: options.pubKey });
  } else {
    throw new TypeError('Missing key derivation input');
  }
}

/**
 * Derives a symmetric encryption key using the given options. Requires a key derivation input to be
 * provided - one of {@link CryptOptions.passphrase} or {@link CryptOptions.pubKey}. If `pubkey` is
 * provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation fails.
 *
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @param options The key derivation options.
 * @returns The derived `CryptoKey` as a promise.
 * @todo Currently relies on WebCrypto API, which has limitations for supporting other cryptography
 *   APIs. This needs to be made adaptable.
 */
export const deriveKey = deriveWebCryptoKey;
