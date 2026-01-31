import { randomBytes } from 'node:crypto';
import { expect, test } from 'vitest';
import { CRYPT_DEFAULTS } from '../crypt/defaults.js';
import { createInstance } from '../instance/instance.js';
import type { KeyDerivationContext } from './kdf.js';
import { NodeKDF } from './node.js';
import { WebCryptoKDF } from './web-crypto.js';

test('KDF: Node & WebCrypto interop', async () => {
  const options: KeyDerivationContext = {
    ...CRYPT_DEFAULTS,
    input: new Uint8Array(randomBytes(32)),
    instance: createInstance(),
    salt: new Uint8Array(randomBytes(16)),
  };

  const [nodeResult, webCryptoResult] = await Promise.all([
    NodeKDF.PBKDF2(options),
    WebCryptoKDF.PBKDF2(options),
  ]);

  expect(nodeResult).toEqual(webCryptoResult);
});
