/**
 * Implements the identity content identifier scheme.
 *
 * With this scheme, a public key from an asymmetric key pair is embedded in the content identifier.
 * The content itself includes a content identifier reference and must be a valid signature
 * verifiable with the public key in the content identifier. This way, only the private key holder
 * can mutate the reference.
 *
 * Identities are derived from the active keyring using BIP32 - so each keyring can generate many
 * identities.
 *
 * @module Identity
 * @category API Reference
 * @experimental
 */

import ecc from '@bitcoinerlab/secp256k1';
import bip32 from 'bip32';
// prettier-ignore
import { instance, maxLength, nonEmpty, pipe, regex, safeParse, strictObject, string } from 'valibot';
// prettier-ignore
import { ContentIdentifier, type ContentIdentifierLike, type ContentIdentifierSchemeParser } from '../cid/cid.js';
import { getContent, putContent } from '../content/api.js';
import type { ECDSAUnwrappedMetadata } from '../ecdsa/wrap.js';
import { FileBuilder } from '../file/file-builder.js';
import type { Instance } from '../instance/instance.js';
import { compareBytes } from '../internal/encoding.js';
import { activeSeeds } from '../keyrings/keyrings.js';
import { unwrap, wrap } from '../wraps/wraps.js';

/** Parsed identity content. */
export interface Identity {
  /** A string ID used to find an identity when iterating through addresses. */
  id: string;
  /** The content this identity points to. */
  ref: ContentIdentifier;
}

/** The content identifier prefix for identity. */
export const prefix = '$pub';

/** The Valibot schema for identity content. */
export const schema = strictObject({
  /** @ignore */
  id: pipe(string(), nonEmpty(), maxLength(100), regex(/^[a-z0-9-]+$/)),
  /** @ignore */
  ref: instance(ContentIdentifier),
});

/** Derives the BIP32 account for the loaded keyring. */
function getAccount(instance: Instance) {
  const seed = activeSeeds.get(instance);

  if (!seed) {
    throw new ReferenceError('No keyring loaded for instance');
  }

  // Purpose             44 | BIP44
  // Coin type         1238 | Astrobase
  // Account              0 | Could potentially be used for alt accounts, organisations?
  // Internal/external    0 | AKA change, not applicable
  return bip32(ecc).fromSeed(Buffer.from(seed)).derivePath(`m/44'/1238'/0'/0`);
}

interface BaseIdentityOptions {
  /** Instance used for keyring and content retrieval. */
  instance: Instance;

  /** Limit of unused BIP32 derivation indexes before giving up. */
  lookaheadLimit?: number;
}

/** Options for {@link getPrivateKey}. */
export interface GetPrivateKeyOptions extends BaseIdentityOptions {
  /** The target public key. */
  publicKey: Uint8Array;
}

/**
 * Tries to get the private key that corresponds to the given public key via the keyring.
 *
 * @throws If private key is unavailable.
 */
export function getPrivateKey(options: GetPrivateKeyOptions) {
  const account = getAccount(options.instance);

  // TODO: lookahead does not reset if an identity root exists!

  for (let i = 0, lookahead = 0; lookahead < (options.lookaheadLimit ?? 20); i++, lookahead++) {
    const derivation = account.derive(i);

    if (compareBytes(derivation.publicKey, options.publicKey)) {
      if (derivation.privateKey) {
        return derivation.privateKey;
      }
      break;
    }
  }

  throw new Error('Private key unavailable');
}
/** Options for {@link getIdentity}. */
export interface GetIdentityOptions extends BaseIdentityOptions {
  /** The string ID of the identity. */
  id: string;
}

/** Return type for {@link getIdentity}. */
export interface GetIdentityResult {
  /** The content identifier of the identity */
  cid: ContentIdentifier;

  /** The identity content. */
  identity: Identity;

  /** The index of the identity BIP32 derivation. */
  index: number;
}

/**
 * Retrieves an identity.
 *
 * @throws If identity not found.
 */
export async function getIdentity(options: GetIdentityOptions): Promise<GetIdentityResult> {
  const account = getAccount(options.instance);

  for (let i = 0, lookahead = 0; lookahead < (options.lookaheadLimit ?? 20); i++) {
    const derivation = account.derive(i);
    const cid = new ContentIdentifier(prefix, derivation.publicKey);
    const identity = await getContent<Identity>(cid, options.instance);
    if (identity) {
      if (identity.id === options.id) {
        return {
          cid,
          identity,
          index: i,
        };
      }
      lookahead = 0;
    } else {
      lookahead++;
    }
  }

  throw new Error('Identity not found');
}

/** Options for {@link putIdentity}. */
export interface PutIdentityOptions extends GetIdentityOptions {
  /** The Content Identifier for the identity to point to. */
  ref: ContentIdentifierLike;
}

/**
 * Sets or replaces the content for an identity.
 *
 * @returns The content identifier of the identity.
 * @throws If unsuccessful.
 */
export async function putIdentity(options: PutIdentityOptions) {
  const { id, instance, ref } = options;
  const account = getAccount(instance);

  let pubKey!: Uint8Array;
  let targetCID: ContentIdentifier | undefined;

  for (let i = 0, lookahead = 0; lookahead < (options.lookaheadLimit ?? 20); i++) {
    const { publicKey } = account.derive(i);
    const derivationCID = new ContentIdentifier(prefix, publicKey);
    const identity = await getContent<Identity>(derivationCID, instance);
    if (identity) {
      if (identity.id === id) {
        pubKey = publicKey;
        targetCID = derivationCID;
        break;
      }
      lookahead = 0;
    } else if (lookahead++ == 1) {
      // If the lookahead limit is reached without a match, we'll use the first available
      pubKey = publicKey;
      targetCID = derivationCID;
    }
  }

  if (targetCID) {
    await putContent(
      targetCID,
      await wrap(instance, {
        metadata: await new FileBuilder<ECDSAUnwrappedMetadata>()
          .setMediaType('application/json')
          .setValue(pubKey, instance),
        type: 'ECDSA',
        value: await new FileBuilder<Identity>()
          .setMediaType('application/json')
          .setValue({ id, ref: new ContentIdentifier(ref) }, instance),
      }),
      { instance },
    );

    return targetCID;
  }
}

/** The identity {@link ContentIdentifierSchemeParser}. */
export const scheme: ContentIdentifierSchemeParser<Identity> = async (cid, content, instance) => {
  const { metadata, type, value } = await unwrap(instance, content);
  const wrapPubKey = await metadata.getValue(instance);
  if (
    type === 'ECDSA' &&
    wrapPubKey instanceof Uint8Array &&
    compareBytes(wrapPubKey, new Uint8Array(cid.value))
  ) {
    const parse = safeParse(schema, await value.getValue(instance));
    return parse.success ? parse.output : undefined;
  }
};
