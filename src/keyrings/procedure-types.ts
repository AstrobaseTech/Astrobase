import type { ContentIdentifier, ContentIdentifierLike } from '../cid/cid.js';

/** The request and response types of `keyring:*` procedures. */
export type KeyringProcedures = {
  /** The request and response types of the `keyring:clear` procedure. */
  'keyring:clear': [undefined, undefined];

  /** The request and response types of the `keyring:create` procedure. */
  'keyring:create': [CreateKeyringRequest, CreateKeyringResult];

  /** The request and response types of the `keyring:import` procedure. */
  'keyring:import': [ImportKeyringRequest, ContentIdentifier];

  /** The request and response types of the `keyring:list` procedure. */
  'keyring:list': [undefined, ContentIdentifier[]];

  /** The request and response types of the `keyring:load` procedure. */
  'keyring:load': [LoadKeyringRequest, unknown];
};

/** Request options for keyring creation. */
export interface CreateKeyringRequest<T = unknown> {
  /** The passphrase used to protect the keyring payload. */
  passphrase: string;
  /** Optional arbitrary metadata to store unencrypted alongside the keyring. */
  metadata?: T;
  /** The wordlist to use for the mnemonic. */
  wordlist: string[];
}

/** Result from keyring creation. */
export interface CreateKeyringResult {
  /** The BIP39 mnemonic (recovery phrase) of the created keyring. */
  mnemonic: string;
  /** The CID of the created keyring. */
  cid: ContentIdentifier;
}

/** Request options for keyring import. */
export interface ImportKeyringRequest<T = unknown> extends CreateKeyringRequest<T> {
  /** The mnemonic sentence. */
  mnemonic: string;
  /** The wordlist to use for the mnemonic. */
  wordlist: string[];
}

/** Request options for keyring load. */
export interface LoadKeyringRequest {
  /** The CID of the target keyring. */
  cid: ContentIdentifierLike;
  /** The passphrase needed to decrypt the keyring. */
  passphrase: string;
  /** The wordlist to use for the mnemonic. */
  wordlist: string[];
}
