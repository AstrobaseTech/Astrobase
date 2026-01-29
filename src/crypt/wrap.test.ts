import { randomBytes } from 'crypto';
import { describe, expect, it, test } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { putIdentity } from '../identity/identity.js';
import { createInstance } from '../instance/instance.js';
import { createInstanceWithLoadedKeyring } from '../keyrings/testing/utils.js';
import * as Crypt from './index.js';
import { WithWebCrypto } from './web-crypto.js';

describe('Encrypt Wrap', () => {
  const { wrap, unwrap } = Crypt.CryptWrapModule;

  const randomPayload = new Uint8Array(randomBytes(32));

  it('Throws if no key derivation input provided', async () => {
    await expect(
      wrap({
        instance: createInstance(WithWebCrypto),
        metadata: Crypt.cryptOptions({}),
        payload: randomPayload,
      }),
    ).rejects.toThrow('No key derivation input was provided');
  });

  test('Passphrase encrypt/decrypt', async () => {
    const passphrase = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(8)));
    const instance = createInstance(WithWebCrypto);

    const { metadata: encryptOutputMetadata, payload: encryptOutputPayload } = await wrap({
      instance,
      metadata: Crypt.cryptOptions({ passphrase }),
      payload: randomPayload,
    });

    expect(encryptOutputPayload).toBeInstanceOf(Uint8Array);
    expect(encryptOutputPayload).not.toEqual(randomPayload);
    expect(encryptOutputMetadata.encAlg).toBe(Crypt.CRYPT_DEFAULTS.encAlg);
    expect(encryptOutputMetadata.hashAlg).toBe(Crypt.CRYPT_DEFAULTS.hashAlg);
    expect(encryptOutputMetadata.iterations).toBe(Crypt.CRYPT_DEFAULTS.iterations);
    expect(encryptOutputMetadata.kdf).toBe(Crypt.CRYPT_DEFAULTS.kdf);
    expect(encryptOutputMetadata.nonce).toBeInstanceOf(Uint8Array);
    expect(encryptOutputMetadata.nonce).toHaveLength(12);
    expect(encryptOutputMetadata.salt).toBeInstanceOf(Uint8Array);
    expect(encryptOutputMetadata.salt).toHaveLength(16);
    expect(encryptOutputMetadata).not.toHaveProperty('passphrase');
    expect(encryptOutputMetadata.pubKey).toBeUndefined();

    const decryptInputMetadata: Crypt.CryptOptions = { ...encryptOutputMetadata };

    // Throws because passphrase was sanitized from metadata output
    await expect(
      unwrap({
        instance,
        metadata: decryptInputMetadata,
        payload: encryptOutputPayload,
      }),
    ).rejects.toThrow('No key derivation input was provided');

    decryptInputMetadata.passphrase = passphrase;

    const { metadata: decryptOutputMetadata, payload: decryptOutputPayload } = await unwrap({
      instance,
      metadata: decryptInputMetadata,
      payload: encryptOutputPayload,
    });

    expect(decryptOutputPayload).toEqual(randomPayload);
    expect(decryptOutputMetadata).toEqual(encryptOutputMetadata);
    expect(decryptOutputMetadata).not.toHaveProperty('passphrase');
  });

  describe('Public key encrypt/decrypt', () => {
    const randomPubKeyMetadata = Crypt.cryptOptions({ pubKey: randomBytes(33) });

    it('Throws if no keyring loaded', () =>
      expect(
        wrap({
          instance: createInstance(WithWebCrypto),
          metadata: randomPubKeyMetadata,
          payload: randomPayload,
        }),
      ).rejects.toThrow(ReferenceError('No keyring loaded for instance')));

    it('Throws if unknown public key provided', async () => {
      const instance = await createInstanceWithLoadedKeyring();

      await expect(
        wrap({
          instance,
          metadata: randomPubKeyMetadata,
          payload: randomPayload,
        }),
      ).rejects.toThrow('Private key unavailable');
    });

    it('Works if known public key provided', async () => {
      const instance = await createInstanceWithLoadedKeyring();

      const identityCID = await putIdentity({
        id: 'test',
        instance,
        ref: new ContentIdentifier('test', [1, 2, 3]),
      });

      const pubKey = new Uint8Array(identityCID!.value);
      const metadata = Crypt.cryptOptions({ pubKey });

      const { metadata: wrappedMetadata, payload: wrappedPayload } = await wrap({
        instance,
        metadata,
        payload: randomPayload,
      });

      expect(wrappedMetadata).toEqual(metadata);

      expect(wrappedPayload).toBeInstanceOf(Uint8Array);
      expect(wrappedPayload).not.toEqual(randomPayload);

      const { metadata: unwrappedMetadata, payload: unwrappedPayload } = await unwrap({
        instance,
        metadata: wrappedMetadata,
        payload: wrappedPayload,
      });

      expect(unwrappedMetadata).toEqual(metadata);

      expect(unwrappedPayload).toEqual(randomPayload);
    });
  });
});
