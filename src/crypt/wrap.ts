import type { WrapModule } from '../wraps/types.js';
import { decrypt, encrypt } from './encrypt.js';
import { sanitizeCryptOptions, type CryptOptions } from './options.js';

/**
 * {@link CryptOptions} without sensitive data. Suitable for storing in Wrap metadata for future
 * decryption.
 */
export type CryptWrapMetadata = Omit<CryptOptions, 'passphrase'>;

/** A Wrap implementation for encrypted payloads. */
export const CryptWrapModule: WrapModule<CryptWrapMetadata, CryptWrapMetadata> = {
  unwrap: async ({ instance, metadata, payload }) => ({
    metadata: sanitizeCryptOptions(metadata),
    payload: new Uint8Array(await decrypt(payload, metadata, instance)),
  }),
  wrap: async ({ instance, metadata, payload }) => ({
    metadata: sanitizeCryptOptions(metadata),
    payload: new Uint8Array(await encrypt(payload, metadata, instance)),
  }),
};
