import type { WrapModule } from '../wraps/types.js';
import { decrypt, encrypt, sanitizeOptions, type EncryptOptions } from './encrypt.js';

/**
 * {@link EncryptOptions} without sensitive data. Suitable for storing in Wrap metadata for future
 * decryption.
 */
export type EncryptWrapMetadata = Omit<EncryptOptions, 'passphrase'>;

/** A Wrap implementation for encrypted payloads. */
export const EncryptWrapModule: WrapModule<EncryptWrapMetadata, EncryptWrapMetadata> = {
  unwrap: async ({ instance, metadata, payload }) => ({
    metadata: sanitizeOptions(metadata),
    payload: new Uint8Array(await decrypt(payload, metadata, instance)),
  }),
  wrap: async ({ instance, metadata, payload }) => ({
    metadata: sanitizeOptions(metadata),
    payload: new Uint8Array(await encrypt(payload, metadata, instance)),
  }),
};
