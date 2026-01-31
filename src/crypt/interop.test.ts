import { randomBytes } from 'node:crypto';
import { expect, test } from 'vitest';
import { createInstance } from '../instance/instance.js';
import { NodeCrypt } from './node.js';
import type { CryptFnContext } from './types.js';
import { WebCryptoCrypt } from './web-crypto.js';

test('Crypt: Node & WebCrypto interop', async () => {
  const encryptOptions: CryptFnContext = {
    encAlg: 'AES-GCM',
    instance: createInstance(),
    key: new Uint8Array(randomBytes(32)),
    nonce: new Uint8Array(randomBytes(12)),
    payload: new Uint8Array(randomBytes(128)),
  };

  const [nodeEncrypted, webCryptoEncrypted] = await Promise.all([
    NodeCrypt['AES-GCM'].encrypt(encryptOptions),
    WebCryptoCrypt.encrypt(encryptOptions),
  ]);

  expect(new Uint8Array(nodeEncrypted)).toEqual(webCryptoEncrypted);

  const decryptOptions: CryptFnContext = { ...encryptOptions, payload: nodeEncrypted };

  const [nodeDecrypted, webCryptoDecrypted] = await Promise.all([
    NodeCrypt['AES-GCM'].encrypt(decryptOptions),
    WebCryptoCrypt.encrypt(decryptOptions),
  ]);

  expect(new Uint8Array(nodeDecrypted)).toEqual(webCryptoDecrypted);
});
