import { cidToBytes } from '../../immutable/cid.js';
import { client } from '../../rpc/client/client.js';
import * as P from '../shared/message-payloads.js';
import { ACTIVE_KEYRING_CHANGE, emit } from './events.js';

/**
 * The data structure for a persisted keyring.
 *
 * @template T The type for the keyring's metadata property.
 */
export interface Keyring<T = unknown> {
  cid: Uint8Array;
  metadata?: T;
}

/** Map of instance ID keys and their active keyring. */
const activeKeyrings: Record<string, Keyring | undefined> = {};

/**
 * Unlocks a keyring and makes it the active keyring.
 *
 * @template T The type of the returned keyring's metadata field.
 * @param options An options object containing the CID of the target keyring, the passphrase to
 *   unlock it, and the wordlist to use.
 * @param instanceID A particular protocol instance ID can be used if using multiple protocol
 *   instances.
 * @returns A promise that resolves with the activated keyring's arbitrary metadata, if any.
 */
export async function activateKeyring<T>(options: P.LoadKeyringRequest, instanceID?: string) {
  const [metadata] = await client.postToAll<P.LoadKeyringResult<T>, P.LoadKeyringRequest>(
    'keyring.load',
    options,
    instanceID,
  );
  const keyring = {
    cid: cidToBytes(options.cid),
    metadata,
  };
  activeKeyrings[instanceID ?? ''] = keyring;
  emit(ACTIVE_KEYRING_CHANGE, keyring, instanceID);
  return metadata;
}

/**
 * Creates a new keyring. The keyring is automatically encrypted and persisted locally, but it is
 * not automatically activated.
 *
 * @param options The options, including the passphrase to use for encryption and any arbitrary
 *   metadata to store alongside the payload.
 * @param instanceID A particular protocol instance ID can be used if using multiple protocol
 *   instances.
 * @returns A promise that resolves with the result, including the ID of the keyring and it's
 *   mnemonic recovery seed phrase.
 */
export function createKeyring<T extends P.CreateKeyringRequest>(options: T, instanceID?: string) {
  return client.postToOne<P.CreateKeyringResult, T>('keyring.create', options, instanceID);
}

/**
 * Deactivates the current active keyring and shreds any keys in working memory. This is the
 * equivalent of a user log out function.
 *
 * Note that persistent storage is not affected. The keyring will remain there in its encrypted
 * form.
 *
 * @param instanceID A particular protocol instance ID can be used if using multiple instances.
 */
export async function deactivateKeyring(instanceID?: string) {
  await client.postToAll<void>('keyring.clear', undefined, instanceID);
  delete activeKeyrings[instanceID ?? ''];
  emit(ACTIVE_KEYRING_CHANGE, null, instanceID);
}

/**
 * @template T The (expected) type of the returned keyring's metadata field.
 * @param instanceID A particular protocol instance ID can be used if using multiple instances.
 * @returns The active keyring, or `undefined` if no keyring is active.
 */
export function getActiveKeyring<T>(instanceID?: string) {
  return activeKeyrings[instanceID ?? ''] as Keyring<T> | undefined;
}

export { getAvailableKeyringCIDs } from '../server/keyring.js';

/**
 * Import a keyring using a mnemonic recovery seed phrase. The keyring is automatically encrypted
 * and persisted, but it is not automatically activated.
 *
 * @param options The options, including the mnemonic, passphrase to use for encryption and any
 *   arbitrary metadata to store alongside the payload.
 * @param instanceID A particular protocol instance ID can be used if using multiple protocol
 *   instances.
 * @returns A promise that resolves with the CID given to the imported keyring.
 */
export function importKeyring(options: P.ImportKeyringRequest, instanceID?: string) {
  return client.postToOne<P.ImportKeyringResult>('keyring.import', options, instanceID);
}
