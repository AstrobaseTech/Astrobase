import { randomBytes } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { createInstance } from '../instance/instance.js';
import { decrypt, encrypt } from './crypt.js';
import { cryptOptions } from './options.js';

describe('Crypt API', () => {
  const encAlg = randomBytes(4).toString('base64');
  const kdf = randomBytes(4).toString('base64');

  const decryptPepper = crypto.getRandomValues(new Uint8Array(16));
  const encryptPepper = crypto.getRandomValues(new Uint8Array(16));

  const instance = createInstance({
    cryptAlgs: {
      [encAlg]: {
        decrypt: ({ payload }) => Buffer.concat([decryptPepper, payload]),
        encrypt: ({ payload }) => Buffer.concat([encryptPepper, payload]),
      },
    },
    kdf: { [kdf]: () => new Uint8Array() },
  });

  const testCrypt = (name: string, fn: typeof decrypt, pepper: Uint8Array) =>
    test(name, () => {
      const payload = crypto.getRandomValues(new Uint8Array(16));
      const passphrase = randomBytes(12).toString('base64');
      const options = cryptOptions({ encAlg, kdf, passphrase });
      const result = fn(payload, options, instance);
      return expect(result).resolves.toEqual(Buffer.concat([pepper, payload]));
    });

  testCrypt('decrypt', decrypt, decryptPepper);
  testCrypt('encrypt', encrypt, encryptPepper);
});
