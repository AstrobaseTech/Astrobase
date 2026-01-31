import { signAsync, verify as nobleVerify } from '@noble/secp256k1';
import { hash, SHA_256 } from '../hashing/index.js';
import { getPrivateKey } from '../identity/identity.js';
import type { Instance } from '../instance/instance.js';

/** SHA-256 via instance algorithm. */
const sha256 = async (instance: Instance, payload: BufferSource) =>
  (await hash(instance, SHA_256, payload)).value;

/**
 * Sign a message with ECDSA using Keyring.
 *
 * @param instance The Instance config.
 * @param payload The buffer of the payload to sign.
 * @param publicKey The buffer of the public key of the target identity to sign as.
 * @returns The buffer of the signature in a Promise.
 * @throws If the private key is unavailable (i.e. wrong or no keyring loaded).
 */
export const sign = async (instance: Instance, payload: BufferSource, publicKey: Uint8Array) =>
  await signAsync(await sha256(instance, payload), getPrivateKey({ instance, publicKey }), {
    prehash: false,
  });

/**
 * Verifies an ECDSA signature with `@noble/secp256k1`, using the instance defined SHA-256 algorithm
 * to get the payload hash.
 *
 * @param instance The Instance config.
 * @param payload The buffer of the payload for the signature.
 * @param signature The buffer of the signature.
 * @param publicKey The buffer of the public key of the key pair that allegedly created the
 *   signature.
 * @returns The verification status in a promise - `true` if it passes, `false` if not.
 */
export const verify = async (
  instance: Instance,
  payload: BufferSource,
  signature: Uint8Array,
  publicKey: Uint8Array,
) => nobleVerify(signature, await sha256(instance, payload), publicKey, { prehash: false });
