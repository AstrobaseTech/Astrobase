import { randomBytes } from 'crypto';
import { describe, expect, it } from 'vitest';
import { deriveKey } from './kdf.js';

describe('KDF: `deriveKey` error handling', () => {
  it('Throws if no key derivation input provided', async () => {
    const result = deriveKey({} as never);
    await expect(result).rejects.toThrow('Missing key derivation input');
  });

  it('Throws if ambiguous key derivation input provided', async () => {
    const options = { passphrase: '1234', publicKey: randomBytes(32) };
    const result = () => deriveKey(options as never);
    await expect(result).rejects.toThrow('Ambiguous key derivation input');
  });
});
