import type { MediaType } from 'content-type';
import { queryChannelsSync } from '../../channels/channels.js';
import { decodeWithCodec } from '../../codec/codecs.js';
import { FileBuilder } from '../../file/file.js';
import { Identifier } from '../../identifiers/identifiers.js';
import { Immutable, putImmutable, type PutOptions } from '../../immutable/index.js';
import { Base58 } from '../../internal/encoding.js';
import { client } from '../../rpc/client/client.js';
import { isWrap, wrap, type ECDSAWrappedMetadata, type WrapValue } from '../../wraps/index.js';
import { getAddressHash, setAddressHash } from './address.js';

// TODO: separate address hash CRUD module

export function getIdentityAddress(identityID: string, instanceID?: string) {
  return client.postToOne('identity.get', identityID, instanceID);
}

export async function getIdentityValue(address: string | Uint8Array, instanceID?: string) {
  const hash = await getAddressHash(address, instanceID);
  if (hash) {
    return queryChannelsSync(async (channel) => {
      if (channel.get) {
        const objectResult = await channel.get(new Identifier(Immutable.key, hash.toBytes()));
        if (objectResult) {
          const file = new FileBuilder(objectResult);
          if (!file.mediaType) {
            return;
          }
          const value = await decodeWithCodec<WrapValue>(file.payload, file.mediaType, instanceID);
          // It must be a signature wrap that has been signed by the address
          if (
            isWrap(value) &&
            value.$ === 'wrap:ecdsa' &&
            (value.m as ECDSAWrappedMetadata).pub ===
              (typeof address === 'string' ? address : Base58.encode(address))
          ) {
            return value;
          }
        }
      }
    }, instanceID);
  }
}

export interface IdentityPutOptions extends PutOptions {
  /**
   * Whether to encrypt the payload with a default encryption.
   *
   * @todo Allow greater configuration. For now you can omit this and simply encrypt yourself.
   */
  encrypt?: boolean;
}

export async function putIdentity(
  address: string | ArrayBuffer,
  value: unknown,
  mediaType: string | MediaType,
  options?: IdentityPutOptions,
) {
  const pubKey = typeof address === 'string' ? Base58.decode(address) : new Uint8Array(address);
  if (options?.encrypt) {
    value = await wrap({ type: 'encrypt', metadata: { pubKey }, value, mediaType });
  }
  value = await wrap({ type: 'ecdsa', metadata: pubKey, value, mediaType: 'application/json' });
  const file = await new FileBuilder()
    .setMediaType('application/json')
    .setValue(value, options?.instanceID);
  const hash = await putImmutable(file, options);
  await setAddressHash(pubKey, hash);
  return hash;
}
