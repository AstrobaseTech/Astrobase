import assert from 'assert';
import { randomBytes } from 'crypto';
import { describe, expect, it } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { Common } from '../common/common.js';
import { putIdentity } from '../identity/identity.js';
import { createInstance } from '../instance/instance.js';
import { createInstanceWithLoadedKeyring } from '../keyrings/testing/utils.js';
import { ECDSA } from './wrap.js';

describe('ECDSA Wrap', () => {
  const payload = new Uint8Array(randomBytes(32));

  it('Throws if no keyring loaded', () =>
    expect(
      ECDSA.wrap({
        instance: createInstance(Common),
        metadata: randomBytes(33),
        payload,
      }),
    ).rejects.toThrow(ReferenceError('No keyring loaded for instance')));

  it('Wraps & unwraps', async () => {
    const instance = await createInstanceWithLoadedKeyring();

    const identityCID = await putIdentity({
      id: 'test',
      instance,
      ref: new ContentIdentifier('test', [1, 2, 3]),
    });

    assert(identityCID);

    const pub = identityCID.value;

    const { metadata: wrappedMetadata, payload: wrappedPayload } = await ECDSA.wrap({
      instance,
      metadata: new Uint8Array(pub),
      payload,
    });

    expect(wrappedMetadata.sig.byteLength).toBe(64);
    expect(wrappedMetadata.pub).toEqual(pub);
    expect(wrappedPayload).toEqual(payload);

    await expect(
      ECDSA.wrap({
        instance,
        metadata: randomBytes(33),
        payload,
      }),
    ).rejects.toThrow('Private key unavailable');

    const { metadata: unwrappedMetadata, payload: unwrappedPayload } = await ECDSA.unwrap({
      instance,
      metadata: wrappedMetadata,
      payload: wrappedPayload,
    });

    expect(unwrappedMetadata).toEqual(pub);
    expect(unwrappedPayload).toEqual(payload);

    // Ensure it throws if pub & sig don't match up
    for (const metadata of [
      {
        pub: wrappedMetadata.pub,
        sig: randomBytes(64),
      },
      {
        pub: randomBytes(33),
        sig: wrappedMetadata.sig,
      },
    ]) {
      await expect(
        ECDSA.unwrap({
          instance,
          metadata,
          payload: wrappedPayload,
        }),
      ).rejects.toThrow('ECDSA signature failed to verify');
    }
  });
});
