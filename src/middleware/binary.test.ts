import { describe, expect, it, test } from 'vitest';
import { encodes } from '../../test/util/encodes.js';
import { Identifier } from '../identifiers/identifiers.js';
import { BinaryMiddleware } from './binary.js';

describe('JSON codec binary middleware', () => {
  for (const [ascii, bin, b58, b64] of encodes) {
    const identifier = new Identifier(bin);

    const bin58 = `$bin:b58:${b58}`;
    const bin64 = `$bin:b64:${b64}`;
    const ref58 = `$ref:b58:${b58}`;

    it('Replaces ArrayBuffer - ' + ascii, () => {
      expect(BinaryMiddleware.replacer(undefined, bin.buffer)).toBe(bin64);
    });

    it('Replaces Uint8Array - ' + ascii, () => {
      expect(BinaryMiddleware.replacer(undefined, bin)).toBe(bin64);
    });

    // TODO: using .toString() now. reimplement test for `replace` instead
    // it('Replaces Identifier - ' + ascii, () => {
    //   expect(BinaryMiddleware.replacer(undefined, identifier)).toBe(ref58);
    // });

    it('Revives base58 binary - ' + ascii, () => {
      expect(BinaryMiddleware.reviver(undefined, bin58)).toEqual(bin);
    });

    it('Revives base64 binary - ' + ascii, () => {
      expect(BinaryMiddleware.reviver(undefined, bin64)).toEqual(bin);
    });

    it('Revives base58 ref - ' + ascii, () => {
      expect(BinaryMiddleware.reviver(undefined, ref58)).toEqual(identifier);
    });
  }

  for (const input of ['abc', '$:abc:def:abc123', {}, []]) {
    const inputAsString = JSON.stringify(input);
    test('Replacer ignores ' + inputAsString, () => {
      expect(BinaryMiddleware.replacer(undefined, input)).toBe(input);
    });
    test('Reviver ignores ' + inputAsString, () => {
      expect(BinaryMiddleware.reviver(undefined, input)).toBe(input);
    });
  }
});
