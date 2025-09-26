import { randomBytes } from 'crypto';
import { describe, expect, it, test } from 'vitest';
import { fuzz } from '../../testing/fuzz.js';
import { Ascii } from '../ascii/ascii.js';
import { createInstance } from '../instance/instance.js';
import { FileBuilder } from './file-builder.js';

describe('File Builder API', () => {
  /** The default empty file, when no buffer value is given, should be valid and completely blank. */
  test('Default empty file validity', () => {
    const file = new FileBuilder();
    expect(file.buffer).toEqual(new Uint8Array([0]));
    expect(file.hasMediaType).toBe(false);
    expect(file.mediaType).toBeInstanceOf(Ascii);
    expect(file.mediaType.encodingStart).toBe(0);
    expect(file.mediaType.encodingEnd).toBe(0);
    expect(file.mediaType.value).toBe('');
    expect(file.payload).toEqual(new Uint8Array());
    expect(file.payloadEncodingStart).toEqual(1);
  });

  /**
   * The buffer can be assigned directly, or set via builder pattern which returns the file for
   * method chaining. It accepts ArrayLike values.
   */
  describe('Set the buffer', () => {
    const file = new FileBuilder();
    let buffer: Uint8Array<ArrayBuffer>;

    test('Assign Uint8Array to setter', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      file.buffer = buffer;
      expect(file.buffer).toEqual(buffer);
    });

    test('Pass Uint8Array to builder', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      expect(file.setBuffer(buffer)).toBe(file);
      expect(file.buffer).toEqual(buffer);
    });

    test('Pass array to builder', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      expect(file.setBuffer(Array.from(buffer))).toBe(file);
      expect(file.buffer).toEqual(buffer);
    });
  });

  /**
   * The media type is an ASCII encoded string starting at index 0 of the buffer and is terminated
   * by a NUL (0x00) byte.
   */
  describe('Media type', () => {
    describe('Media type parsing', () => {
      it('Parses valid files with a media type', () => {
        fuzz(() => {
          const mediaTypeBytes = randomBytes(25).map((b) => (b == 0 ? 1 : b));
          mediaTypeBytes[24] = 0;

          const validMediaTypeFile = new FileBuilder([
            ...mediaTypeBytes,
            ...randomBytes(randomBytes(1)[0]),
          ]);

          const mediaTypeString = new TextDecoder().decode(mediaTypeBytes.subarray(0, 24));

          expect(validMediaTypeFile.hasMediaType).toBe(true);
          expect(validMediaTypeFile.mediaType.encodingStart).toEqual(0);
          expect(validMediaTypeFile.mediaType.encodingEnd).toEqual(24);
          expect(validMediaTypeFile.mediaType.value).toEqual(mediaTypeString);

          const emptyMediaTypeFile = new FileBuilder([0, ...randomBytes(randomBytes(1)[0])]);

          expect(emptyMediaTypeFile.hasMediaType).toBe(false);
          expect(emptyMediaTypeFile.mediaType.encodingStart).toEqual(0);
          expect(emptyMediaTypeFile.mediaType.encodingEnd).toEqual(0);
          expect(emptyMediaTypeFile.mediaType.value).toEqual('');
        }, 1000);
      });

      it('Throws for EOF error', () => {
        let file = new FileBuilder([]);
        expect(() => file.hasMediaType).toThrow(RangeError);
        expect(() => file.mediaType.value).toThrow(RangeError);

        file = new FileBuilder(randomBytes(16).map((b) => (b == 0 ? 1 : b)));
        expect(() => file.hasMediaType).toThrow(RangeError);
        expect(() => file.mediaType.value).toThrow(RangeError);
      });
    });

    test('Set the media type', () => {
      const badMediaType = '1234567890';
      const goodMediaType = 'application/json';
      const payload = Uint8Array.from([1, 2, 3, 4]);

      const file = new FileBuilder([0, ...payload]);

      expect(() => file.setMediaType(badMediaType)).toThrow(TypeError);

      expect(file.setMediaType(goodMediaType)).toBe(file);

      expect(file.hasMediaType).toBe(true);
      expect(file.mediaType.value).toBe(goodMediaType);
      expect(file.payload).toEqual(payload);
    });
  });

  test('Set the payload', () => {
    const payloadBefore = crypto.getRandomValues(new Uint8Array(16));
    const payloadAfter = crypto.getRandomValues(new Uint8Array(16));

    const file = new FileBuilder([0, ...payloadBefore]);

    expect(file.setPayload(payloadAfter)).toBe(file);
    expect(file.payload).toEqual(payloadAfter);
  });

  test('getValue', async () => {
    const instance = createInstance({
      codecs: {
        'test/file-builder-get-value': {
          decode: (payload) => payload.toReversed(),
          encode: (payload: Uint8Array<ArrayBuffer>) => payload,
        },
      },
    });

    const file = new FileBuilder()
      .setMediaType('test/file-builder-get-value')
      .setPayload([1, 2, 3, 4, 5]);

    await expect(file.getValue(instance)).resolves.toEqual(new Uint8Array([5, 4, 3, 2, 1]));
  });

  test('setValue', async () => {
    const instance = createInstance({
      codecs: {
        'test/file-builder-set-value': {
          decode: (payload) => payload,
          encode: (payload: Uint8Array) => payload.toReversed(),
        },
      },
    });

    const file = await new FileBuilder()
      .setMediaType('test/file-builder-set-value')
      .setValue([1, 2, 3, 4, 5], instance);

    expect(file.payload).toEqual(new Uint8Array([5, 4, 3, 2, 1]));
  });

  test('setValue without a media type set fails', () =>
    expect(new FileBuilder().setValue('test', createInstance())).rejects.toThrow(
      TypeError('Cannot use `setValue` without a media type set'),
    ));
});
