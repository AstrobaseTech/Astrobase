import type { WrapModule } from '../wraps/types.js';
import { sign, verify } from './ecdsa.js';

/** The public key of the key pair for the signature. */
export type ECDSAUnwrappedMetadata = Uint8Array;

/** Metadata required to validate signature. */
export interface ECDSAWrappedMetadata {
  /** Public key. */
  pub: Uint8Array;
  /** Signature. */
  sig: Uint8Array;
}

/** A Wrap implementation for ECDSA signatures. */
export const ECDSA: WrapModule<ECDSAWrappedMetadata, ECDSAUnwrappedMetadata> = {
  async unwrap({ instance, metadata, payload }) {
    if (!(await verify(instance, payload, metadata.sig, metadata.pub))) {
      throw new Error('ECDSA signature failed to verify');
    }
    return { metadata: metadata.pub, payload };
  },
  wrap: async ({ instance, metadata, payload }) => ({
    metadata: {
      sig: await sign(instance, payload, metadata),
      pub: metadata,
    },
    payload,
  }),
};
