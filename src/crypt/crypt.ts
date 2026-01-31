import { getOrThrow, type Instance } from '../instance/instance.js';
import { deriveKey } from '../kdf/kdf.js';
import type { CryptOptions } from './options.js';

async function crypt(
  this: 'decrypt' | 'encrypt',
  payload: Uint8Array<ArrayBuffer>,
  options: CryptOptions,
  instance: Instance,
) {
  return await getOrThrow(instance, 'cryptAlgs', options.encAlg)[this]({
    encAlg: options.encAlg,
    instance,
    key: await deriveKey({ instance, ...options }),
    nonce: options.nonce,
    payload,
  });
}

/**
 * Decrypts the payload using the given options. Requires a key derivation input to be provided -
 * one of {@link CryptOptions.passphrase} or {@link CryptOptions.publicKey}. If `publicKey` is
 * provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided, or if key derivation or decryption
 * fails.
 *
 * @param payload The payload to decrypt.
 * @param options The full options object.
 * @param instance The instance of the active Keyring when using `publicKey`.
 * @returns The decrypted payload as a promise.
 */
export const decrypt = crypt.bind('decrypt');

/**
 * Encrypts the payload using the given options. Requires a key derivation input to be provided -
 * one of {@link CryptOptions.passphrase} or {@link CryptOptions.publicKey}. If `publicKey` is
 * provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation or encryption
 * fails.
 *
 * @param payload The payload to decrypt.
 * @param options The full options object.
 * @param instance The instance of the active Keyring when using `publicKey`.
 * @returns The encrypted payload as a promise.
 */
export const encrypt = crypt.bind('encrypt');
