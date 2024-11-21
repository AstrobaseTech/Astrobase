import { describe, expect, test } from 'vitest';
import {
  ContentIdentifier,
  SchemeRegistry,
  type ContentIdentifierSchemeParser,
} from './identifiers.js';

describe('Scheme Registry', () => {
  const instanceID = 'Scheme Registry';
  const strategy: ContentIdentifierSchemeParser<unknown> = (_, v) => v;

  test('Key validation', () => {
    for (const key of [0, 2]) {
      expect(() => SchemeRegistry.register({ key, strategy }, { instanceID })).not.toThrow();
    }
    for (const key of [2.1, '2.1', '2'] as never[]) {
      expect(() => SchemeRegistry.register({ key, strategy }, { instanceID })).toThrow(
        'Invalid key',
      );
    }
  });

  test('Strategy validation', () => {
    expect(() => SchemeRegistry.register({ key: 3, strategy })).not.toThrow();
    expect(() => SchemeRegistry.register({ key: 4 } as never)).toThrow('Invalid strategy');
    expect(() => SchemeRegistry.register({ key: 4, parse: '' } as never)).toThrow(
      'Invalid strategy',
    );
  });
});

test('Identifier class', () => {
  for (const { bytes, type, value, b58 } of [
    {
      bytes: [1, 2, 3, 4],
      type: 1,
      value: [2, 3, 4],
      b58: '2VfUX',
    },
    {
      bytes: [232, 7, 2, 3, 4],
      type: 1000,
      value: [2, 3, 4],
      b58: 'TBJiAGb',
    },
  ]) {
    for (const id of [new ContentIdentifier(bytes), new ContentIdentifier(b58)]) {
      for (const i in id.bytes) {
        expect(id.bytes[i]).toBe(bytes[i]);
      }
      expect(id.type.value).toBe(type);
      for (const i in id.rawValue) {
        expect(id.rawValue[i]).toBe(value[i]);
      }
      expect(id.toBase58()).toEqual(b58);
    }
  }
});
