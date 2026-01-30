import { randomBytes } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { createInstance } from '../../instance/instance.js';
import { assembleCryptoInstanceConfig } from '../assemble-instance-config.js';
import { decrypt, encrypt } from '../crypt.js';
import { cryptOptions } from '../options.js';
import type { CryptModule } from '../types.js';

export const testCryptSupport = (name: string, module: CryptModule, algs: readonly string[]) =>
  describe(`Crypto/${name}`, () => {
    const instance = createInstance(assembleCryptoInstanceConfig(module, algs));

    for (const encAlg of algs) {
      test(encAlg, async () => {
        const payload = crypto.getRandomValues(new Uint8Array(32));
        const passphrase = new TextDecoder().decode(randomBytes(16));
        const options = cryptOptions({ encAlg, passphrase });
        const encrypted = await encrypt(payload, options, instance);
        const decrypted = await decrypt(encrypted, options, instance);
        expect(new Uint8Array(decrypted)).toEqual(payload);
      });
    }
  });
