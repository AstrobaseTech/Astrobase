import { describe, expect, it, test } from 'vitest';
import { encodes } from '../../testing/encodes.js';
import { ContentIdentifier } from '../cid/cid.js';
import { BinaryMiddleware } from './binary.js';

describe('JSON codec binary middleware', () => {
  for (const [ascii, bin, b64, bech32m] of encodes) {
    const identifier = new ContentIdentifier('test', [...bin]);

    const binStr = `$bin:b64:${b64}`;
    const cidStr = `$cid:${bech32m}`;

    it('Replaces ArrayBuffer - ' + ascii, () => {
      expect(BinaryMiddleware.replacer(undefined, bin.buffer)).toBe(binStr);
    });

    it('Replaces Uint8Array - ' + ascii, () => {
      expect(BinaryMiddleware.replacer(undefined, bin)).toBe(binStr);
    });

    it('Revives base64 binary - ' + ascii, () => {
      expect(BinaryMiddleware.reviver(undefined, binStr)).toEqual(bin);
    });

    it('Revives cid - ' + ascii, () => {
      expect(BinaryMiddleware.reviver(undefined, cidStr)).toEqual(identifier);
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
