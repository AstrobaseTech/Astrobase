import { randomBytes } from 'crypto';
import { describe, expect, it } from 'vitest';
import { createInstance } from '../instance/instance.js';
import { prepareKeyDerivationInput } from './kdf.js';

describe('Crypt/KDF: prepareKeyDerivationInput', () => {
  it('Throws if no key derivation input provided', () => {
    const fn = () => prepareKeyDerivationInput(createInstance(), {});
    expect(fn).toThrow('Missing key derivation input');
  });

  it('Throws if ambiguous key derivation input provided', () => {
    const options = { passphrase: '1234', pubKey: randomBytes(32) };
    const fn = () => prepareKeyDerivationInput(createInstance(), options);
    expect(fn).toThrow('Ambiguous key derivation input');
  });

  it('Supports passphrase', () => {
    const passphrase = randomBytes(8).toString('base64');
    const result = prepareKeyDerivationInput(createInstance(), { passphrase });
    expect(result).toEqual(new TextEncoder().encode(passphrase));
  });

  it.todo('Supports public key');
});
