import { getPrivateKey } from '../identity/identity.js';
import type { Instance } from '../instance/instance.js';
import type { CryptOptions } from './options.js';

/**
 * Derives a symmetric encryption key using the given options. Requires a key derivation input to be
 * provided - one of {@link CryptOptions.passphrase} or {@link CryptOptions.pubKey}. If `pubkey` is
 * provided, then the Identity's private key must be available in the Keyring.
 *
 * The promise will error if no key derivation input is provided or if key derivation fails.
 *
 * @param instance The instance of the active Keyring when using `pubKey`.
 * @param options The full options to be used.
 * @returns The derived crypto key as a promise.
 */
export async function deriveKey(instance: Instance, options: CryptOptions) {
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
