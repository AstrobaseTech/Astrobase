import { encode, encodingLength } from 'varint';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { fuzz } from '../../test/util/utils.js';
import { DEFAULT_FILE_VERSION, File, SUPPORTED_FILE_VERSIONS, TIMESTAMP_BITMASK } from './file.js';

describe('File Builder API', () => {
  /** The default empty file, when no buffer value is given, should be valid and completely blank */
  test('Default empty file validity', () => {
    const file = new File();
    expect(file.buffer).toEqual(new Uint8Array([DEFAULT_FILE_VERSION, 0]));
    expect(file.flagsByte).toBe(0);
    expect(file.hasMediaType).toBe(false);
    expect(file.hasTimestamp).toBe(false);
    expect(file.mediaType).toBeUndefined();
    expect(file.payload).toEqual(new Uint8Array());
    expect(file.timestamp).toBeUndefined();
    expect(file.version.value).toBe(DEFAULT_FILE_VERSION);
    expect(file.version.encodingLength).toBe(encodingLength(DEFAULT_FILE_VERSION));
  });

  /**
   * Buffer can be assigned directly via a setter or set using a builder pattern which returns the
   * file for method chaining. It accepts ArrayLike values.
   */
  describe('Set the buffer', () => {
    const file = new File();
    let buffer: Uint8Array;
    let builderReturn: File;

    test('Assign Uint8Array to setter', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      file.buffer = buffer;
      expect(file.buffer).toEqual(buffer);
    });

    test('Pass Uint8Array to builder', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      builderReturn = file.setBuffer(buffer);
      expect(builderReturn).toBe(file);
      expect(file.buffer).toEqual(buffer);
    });

    test('Assign array to setter', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      file.buffer = Array.from(buffer);
      expect(file.buffer).toEqual(buffer);
    });

    test('Pass array to builder', () => {
      buffer = crypto.getRandomValues(new Uint8Array(32));
      builderReturn = file.setBuffer(Array.from(buffer));
      expect(builderReturn).toBe(file);
      expect(file.buffer).toEqual(buffer);
    });
  });

  /**
   * The API only understands how to parse file encoding version 1. If version != 1, The API should
   * throw a `TypeError` when attempting to parse anything else from the file buffer.
   */
  test('Unrecognised version behaviour', () => {
    const file = new File();
    const tested = new Set<number>();

    fuzz(() => {
      let version: number;

      do {
        version = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
      } while (SUPPORTED_FILE_VERSIONS.has(version) || tested.has(version));
      tested.add(version);

      file.buffer = [...encode(version), 0];

      expect(file.version.value).toBe(version);
      expect(file.version.encodingLength).toBe(encodingLength(version));

      expect(() => file.flagsByte).toThrow(TypeError);
      expect(() => file.hasMediaType).toThrow(TypeError);
      expect(() => file.hasTimestamp).toThrow(TypeError);
      expect(() => file.mediaType).toThrow(TypeError);
      expect(() => file.payload).toThrow(TypeError);
      expect(() => file.timestamp).toThrow(TypeError);
    }, 1000);
  });

  describe('Timestamp', () => {
    describe('Timestamp parsing', () => {
      /**
       * A timestamped file will have the timestamp bit flag set. The timestamp immediately follows
       * the flags byte and is 4 bytes long. It is a 32 bit unsigned integer, encoded with the least
       * significant byte (LSB) first.
       */
      it('Parses valid files with timestamps', () => {
        for (const [bytes, timestamp] of [
          [[0, 0, 0, 0], 0],
          [[241, 151, 63, 18], 306157553],
          [[68, 145, 133, 216], 3632632132],
          [[70, 140, 41, 217], 3643378758],
          [[174, 133, 123, 24], 410748334],
          [[185, 116, 134, 24], 411464889],
          [[165, 90, 147, 251], 4220738213],
          [[15, 182, 47, 32], 539997711],
          [[66, 230, 133, 139], 2340808258],
          [[173, 201, 84, 177], 2975123885],
        ] as const) {
          const file = new File([1, 0b10000000, ...bytes]);
          expect(file.hasTimestamp).toBe(true);
          expect(file.timestamp).toBe(timestamp);
        }
      });

      it('Throws for EOF error', () => {
        const file = new File([1, 0b10000000, 0]);
        expect(file.hasTimestamp).toBe(true);
        expect(() => file.timestamp).toThrow(RangeError);
      });
    });

    const payload = Uint8Array.from([1, 2, 3, 4]);

    describe('Set the timestamp', () => {
      const file = new File([1, 0, ...payload]);
      let timestamp: number;

      expect(file.version.value).toBe(1);
      expect(file.hasTimestamp).toBe(false);
      expect(file.timestamp).toBeUndefined();
      expect(file.payload).toEqual(payload);

      beforeEach(() => {
        timestamp = Math.floor(Math.random() * (2 ** 32 - 1));
      });

      test('Direct assignment', () => {
        expect(() => (file.timestamp = timestamp)).not.toThrow();

        expect(file.hasTimestamp).toBe(true);
        expect(file.timestamp).toBe(timestamp);
        expect(file.payload).toEqual(payload);
      });

      test('Builder', () => {
        const builderReturn = file.setTimestamp(timestamp);
        expect(builderReturn).toBe(file);

        expect(file.hasTimestamp).toBe(true);
        expect(file.timestamp).toBe(timestamp);
        expect(file.payload).toEqual(payload);
      });
    });

    test('Clear the timestamp', () => {
      const file = new File([1, TIMESTAMP_BITMASK, 80, 0, 0, 0, ...payload]);

      expect(file.version.value).toBe(1);
      expect(file.hasTimestamp).toBe(true);
      expect(file.timestamp).toBe(80);
      expect(file.payload).toEqual(payload);

      const builderReturn = file.clearTimestamp();
      expect(builderReturn).toBe(file);

      expect(file.hasTimestamp).toBe(false);
      expect(file.timestamp).toBeUndefined();
      expect(file.payload).toEqual(payload);
    });
  });

  describe('Media type', () => {
    describe('Media type parsing', () => {
      /**
       * A file with a media type will have the media type bit flag set. The media type is an ASCII
       * encoded string that follows the timestamp and is terminated by a NUL (0x00) byte.
       */
      it('Parses valid files with a media type', () => {
        fuzz(() => {
          const mediaType = crypto.getRandomValues(new Uint8Array(25)).map((b) => (b == 0 ? 1 : b));
          mediaType[24] = 0;
          const timestamp = crypto.getRandomValues(new Uint8Array(4));

          const nonTimestampedFile = new File([1, 0b01000000, ...mediaType]);
          const timestampedFile = new File([1, 0b11000000, ...timestamp, ...mediaType]);

          const mediaTypeWithoutNul = new TextDecoder().decode(mediaType.subarray(0, 24));

          expect(nonTimestampedFile.hasMediaType).toBe(true);
          expect(nonTimestampedFile.mediaType?.value).toEqual(mediaTypeWithoutNul);

          expect(timestampedFile.hasMediaType).toBe(true);
          expect(timestampedFile.mediaType?.value).toEqual(mediaTypeWithoutNul);
        }, 1000);
      });

      it('Throws for EOF error', () => {
        const file = new File([1, 0b01000000]);
        expect(file.hasMediaType).toBe(true);
        expect(() => file.mediaType?.value).toThrow(RangeError);
      });
    });

    describe('Set the media type', () => {
      const badMediaType = '1234567890';
      const goodMediaType = 'application/json';
      const payload = Uint8Array.from([1, 2, 3, 4]);

      let file: File;

      beforeEach(() => {
        file = new File([1, 0, ...payload]);
        expect(file.version.value).toBe(1);
        expect(file.hasMediaType).toBe(false);
        expect(file.mediaType).toBeUndefined();
        expect(file.payload).toEqual(payload);
      });

      test('Direct assignment', () => {
        expect(() => (file.mediaType = badMediaType)).toThrow(TypeError);

        expect(() => (file.mediaType = goodMediaType)).not.toThrow();

        expect(file.hasMediaType).toBe(true);
        expect(file.mediaType?.value).toBe(goodMediaType);
        expect(file.payload).toEqual(payload);
      });

      test('Builder', () => {
        expect(() => file.setMediaType(badMediaType)).toThrow(TypeError);

        const builderReturn = file.setMediaType(goodMediaType);
        expect(builderReturn).toBe(file);

        expect(file.hasMediaType).toBe(true);
        expect(file.mediaType?.value).toBe(goodMediaType);
        expect(file.payload).toEqual(payload);
      });
    });
  });

  describe('Set the payload', () => {
    const payloadBefore = crypto.getRandomValues(new Uint8Array(16));
    const payloadAfter = crypto.getRandomValues(new Uint8Array(16));

    let file: File;

    beforeEach(() => {
      file = new File([1, 0, ...payloadBefore]);
      expect(file.version.value).toBe(1);
      expect(file.hasMediaType).toBe(false);
      expect(file.mediaType).toBeUndefined();
      expect(file.payload).toEqual(payloadBefore);
    });

    test('Direct assignment', () => {
      expect(() => (file.payload = payloadAfter)).not.toThrow();
      expect(file.payload).toEqual(payloadAfter);
    });

    test('Builder', () => {
      const builderReturn = file.setPayload(payloadAfter);
      expect(builderReturn).toBe(file);
      expect(file.payload).toEqual(payloadAfter);
    });
  });

  test.todo('Get value');
  test.todo('Set value');
});
