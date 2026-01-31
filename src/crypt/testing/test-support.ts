import { randomBytes } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { createInstance } from '../../instance/instance.js';
import type { CryptFnContext, CryptModule } from '../types.js';

export const testCryptSupport = (
  name: string,
  module: CryptModule,
  tests: { encAlg: string; nonceLength: number }[],
) =>
  describe(`Crypto/${name}`, () => {
    const instance = createInstance();
    const key = new Uint8Array(randomBytes(32));
    const payload = new Uint8Array(randomBytes(128));
    for (const { encAlg, nonceLength } of tests) {
      test(encAlg, async () => {
        const nonce = new Uint8Array(randomBytes(nonceLength));
        const options: CryptFnContext = { encAlg, instance, key, nonce, payload };
        const encrypted = await module.encrypt(options);
        expect(new Uint8Array(encrypted)).not.toEqual(payload);
        const decrypted = await module.decrypt({ ...options, payload: encrypted });
        expect(new Uint8Array(decrypted)).toEqual(payload);
      });
    }
  });
