import { describe, expect, it, test } from 'vitest';
import { Ascii } from './ascii.js';

describe('Ascii class', () => {
  const hello = new TextEncoder().encode('Hello');

  describe('parses a valid NUL terminated string', () => {
    const buffer = new Uint8Array([...hello, 0, 100, 101, 102, 103, 32, 0]);

    test('no offset', () => {
      const asciiNoOffset = new Ascii(buffer);
      expect(asciiNoOffset.value).toBe('Hello');
      expect(asciiNoOffset.encodingStart).toBe(0);
      expect(asciiNoOffset.encodingEnd).toBe(5);
    });

    test('with offset', () => {
      const asciiWithOffset = new Ascii(buffer, 1);
      expect(asciiWithOffset.value).toBe('ello');
      expect(asciiWithOffset.encodingStart).toBe(1);
      expect(asciiWithOffset.encodingEnd).toBe(5);
    });
  });

  it('throws RangeError when no NUL terminator is found', () => {
    const ascii = new Ascii(hello);
    expect(ascii.encodingStart).toBe(0);
    const error = RangeError('Missing NUL');
    expect(() => ascii.value).toThrow(error);
    expect(() => ascii.encodingEnd).toThrow(error);
  });
});
