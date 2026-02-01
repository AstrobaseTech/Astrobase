import { randomBytes } from 'crypto';
import { describe, expect, it } from 'vitest';
import { deriveKey, type KeyDerivationOptions } from './kdf.js';

describe('KDF: `deriveKey` error handling', () => {
  it('Throws if no key derivation input provided', async () => {
    const result = deriveKey({} as never);
    await expect(result).rejects.toThrow('Missing key derivation input');
  });

  it('Throws if ambiguous key derivation input provided', async () => {
    const options: Partial<KeyDerivationOptions>[] = [
      { passphrase: '1234', publicKey: new Uint8Array(randomBytes(32)) },
      { key: new Uint8Array(randomBytes(32)), passphrase: '1234' },
      { key: new Uint8Array(randomBytes(32)), publicKey: new Uint8Array(randomBytes(32)) },
    ];
    for (const item of options) {
      const result = () => deriveKey(item as never);
      await expect(result).rejects.toThrow('Ambiguous key derivation input');
    }
  });
});
