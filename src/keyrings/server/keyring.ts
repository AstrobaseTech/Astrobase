import { FileBuilder } from '../../file/file.js';
import { Identifier, getOne, type IdentifierSchema } from '../../identifiers/identifiers.js';
import { encodeWithCodec } from '../../immutable/codecs.js';
import {
  Hash,
  deleteImmutable,
  getImmutable,
  putImmutable,
  type CIDLike,
} from '../../immutable/index.js';
import type { WrapConfig } from '../../wraps/wraps.js';
import { KEYRINGS_INSTANCE_ID } from '../shared/constants.js';
import type * as P from '../shared/message-payloads.js';
import { entropyToMnemonic, mnemonicToEntropy, mnemonicToSeed } from './mnemonic/bip39.js';
import { decrypt, type EncryptWrapValue } from './wrap/encrypt.js';

export interface PersistedKeyring<T = unknown> {
  id: number;
  metadata?: T;
  payload: EncryptWrapValue;
}

export const activeSeeds: Record<string, Uint8Array> = {};

/** @deprecated Will be superceded by simple mutable identifiers. */
export const KeyringIndexIdentifier = {
  key: 10,
  async parse(_, v, instanceID) {
    const index = await getImmutable<string[]>(v, instanceID);
    if (index && index instanceof Array) {
      return v;
    }
  },
} satisfies IdentifierSchema;

export function clearKeyring(instanceID = '') {
  activeSeeds[instanceID]?.fill(0);
  delete activeSeeds[instanceID];
}

export async function createKeyring(
  request: P.CreateKeyringRequest,
): Promise<P.CreateKeyringResult> {
  if (!request.passphrase) {
    throw new TypeError('No passphrase provided');
  }
  const entropy = crypto.getRandomValues(new Uint8Array(16));
  const [mnemonic, cid] = await Promise.all([
    entropyToMnemonic(entropy, request.wordlist).then((m) => m.join(' ')),
    saveKeyring(entropy, request.passphrase, request.metadata),
  ]);
  return { mnemonic, cid };
}

/** @returns A promise that resolves with an array of all available keyring identifier strings. */
export async function getAvailableKeyringCIDs(): Promise<string[]> {
  const cid = await getOne<CIDLike>(
    new Identifier(KeyringIndexIdentifier.key, []),
    KEYRINGS_INSTANCE_ID,
  );
  return cid ? ((await getImmutable(cid, KEYRINGS_INSTANCE_ID)) ?? []) : [];
}

export async function importKeyring(request: P.ImportKeyringRequest) {
  if (!request.passphrase) {
    throw new TypeError('No passphrase provided');
  }
  const entropy = await mnemonicToEntropy(request.mnemonic.split(' '), request.wordlist);
  return saveKeyring(entropy, request.passphrase, request.metadata);
}

export async function loadKeyring<T>(
  request: P.LoadKeyringRequest,
  instanceID?: string,
): Promise<T> {
  const keyring = await getImmutable<PersistedKeyring<T>>(request.cid, KEYRINGS_INSTANCE_ID);
  if (!keyring) {
    throw new Error('Keyring not found');
  }
  keyring.payload.m.passphrase = request.passphrase;
  const entropy = await decrypt(keyring.payload.p, keyring.payload.m);
  const mnemonic = await entropyToMnemonic(entropy, request.wordlist);
  const seed = await mnemonicToSeed(mnemonic.join(' '));
  activeSeeds[instanceID ?? ''] = new Uint8Array(seed);
  return keyring.metadata as T;
}

export async function saveKeyring(
  entropy: Uint8Array,
  passphrase: string,
  metadata: unknown,
  replaceCID?: CIDLike,
): Promise<Hash> {
  const wrapConfig: WrapConfig = {
    mediaType: 'application/octet-stream',
    metadata: { passphrase },
    type: 'encrypt',
    value: entropy,
  };
  const mediaType = 'application/json';
  const fileValue = { metadata, payload: wrapConfig };
  const filePayload = await encodeWithCodec(fileValue, mediaType);
  const file = new FileBuilder().setPayload(filePayload).setMediaType(mediaType);
  const cid = await putImmutable(file, { instanceID: KEYRINGS_INSTANCE_ID });
  const cidB58 = cid.toBase58();
  const index = await getAvailableKeyringCIDs();
  if (!index.includes(cidB58)) {
    index.push(cidB58);
  }

  /**
   * @todo(fix): Once there's a convenient way to compare CIDs, we should add a check here to ensure
   * replaceCID != cid. For now, it's not an issue as long as each cipher payload uses unique IV/salt.
   */
  if (replaceCID) {
    void deleteImmutable(replaceCID, KEYRINGS_INSTANCE_ID);
  }

  return cid;
}
