import { describe, expect, test } from 'vitest';
import { createInstance } from '../instance/instance.js';
import { decrypt, encrypt } from './crypt.js';
import { cryptOptions } from './options.js';
import { WebCryptoSupportedCryptAlgs } from './web-crypto.js';

describe('Crypt API', () => {
  // // TODO(fix): KDF uses WebCrypto - requires supported encAlg identifier
  // const encAlg = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(6)));
  const encAlg = WebCryptoSupportedCryptAlgs[0];

  const decryptPepper = crypto.getRandomValues(new Uint8Array(16));
  const encryptPepper = crypto.getRandomValues(new Uint8Array(16));

  const instance = createInstance({
    cryptAlgs: {
      [encAlg]: {
        decrypt: ({ payload }) => Buffer.concat([decryptPepper, payload]),
        encrypt: ({ payload }) => Buffer.concat([encryptPepper, payload]),
      },
    },
  });

  const testCrypt = (fn: typeof decrypt, pepper: Uint8Array) =>
    test(fn.name, () => {
      const payload = crypto.getRandomValues(new Uint8Array(16));
      const result = fn(payload, cryptOptions({ encAlg, passphrase: 'test' }), instance);
      return expect(result).resolves.toEqual(Buffer.concat([pepper, payload]));
    });

  testCrypt(decrypt, decryptPepper);
  testCrypt(encrypt, encryptPepper);
});
