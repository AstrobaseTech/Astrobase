import type { Instance } from '../instance/instance.js';
import type { MaybePromise } from '../internal/maybe-promise.js';

/** Context supplied to {@link CryptFn}. */
export interface CryptFnContext {
  /** The encryption algorithm identifier. */
  encAlg: string;
  /** The instance. */
  instance: Instance;
  /** The encryption key to use. */
  key: Uint8Array<ArrayBuffer>;
  /** The nonce/IV. */
  nonce: Uint8Array<ArrayBuffer>;
  /** The payload to process. */
  payload: Uint8Array<ArrayBuffer>;
}

/** An encryption algorithm implementation function. */
export type CryptFn = (context: CryptFnContext) => MaybePromise<Uint8Array<ArrayBuffer>>;

/** A module providing an implementation for a particular encryption algorithm. */
export interface CryptModule {
  /** The decryption implementation function. */
  decrypt: CryptFn;
  /** The encryption implementation function. */
  encrypt: CryptFn;
}
