import { encode, encodingLength } from 'varint';
import { describe, expect, test } from 'vitest';
import { DEFAULT_FILE_VERSION, File, SUPPORTED_FILE_VERSIONS } from './file.js';
import { fuzz } from '../../test/util/utils.js';

describe('File Builder API', () => {
  /** The default empty file, when no buffer value is given, should be valid and completely blank */
  test('Default empty file validity', () => {
    const file = new File();
    expect(file.buffer).toEqual([DEFAULT_FILE_VERSION, 0]);
    expect(file.flagsByte).toBe(0);
    expect(file.hasMediaType).toBe(false);
    expect(file.hasTimestamp).toBe(false);
    expect(file.mediaType).toBeUndefined();
    expect(file.mediaTypeEncodingEnd).toBeUndefined();
    expect(file.mediaTypeEncodingStart).toBeUndefined();
    expect(file.payload).toEqual([]);
    expect(file.timestamp).toBeUndefined();
    expect(file.version).toBe(DEFAULT_FILE_VERSION);
    expect(file.versionEncodingLength).toBe(encodingLength(DEFAULT_FILE_VERSION));
  });

  /**
   * The API only understands how to parse file encoding version 1. If version != 1, The API should
   * throw a `TypeError` when attempting to parse anything else from the file buffer.
   */
  test('Unrecognised version behaviour', () => {
    fuzz(() => {
      const file = new File();
      let version: number;

      do {
        version = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
      } while (SUPPORTED_FILE_VERSIONS.includes(version));

      file.buffer = [...encode(version), 0];

      expect(file.version).toBe(version);
      expect(file.versionEncodingLength).toBe(encodingLength(version));

      expect(() => file.flagsByte).toThrow(TypeError);
      expect(() => file.hasMediaType).toThrow(TypeError);
      expect(() => file.hasTimestamp).toThrow(TypeError);
      expect(() => file.mediaType).toThrow(TypeError);
      expect(() => file.mediaTypeEncodingEnd).toThrow(TypeError);
      expect(() => file.mediaTypeEncodingStart).toThrow(TypeError);
      expect(() => file.payload).toThrow(TypeError);
      expect(() => file.timestamp).toThrow(TypeError);
    }, 1000);
  });

  test.todo('Media type parsing');

  test.todo('Timestamp parsing');

  test.todo('Payload parsing');
});
