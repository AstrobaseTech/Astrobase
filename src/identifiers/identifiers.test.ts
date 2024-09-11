import { describe, expect, test } from 'vitest';
import { RegistryError } from '../registry/registry.js';
import { ContentIdentifier, SchemeRegistry, type ContentIdentifierScheme } from './identifiers.js';

describe('Identifier Registry', () => {
  const instanceID = 'Identifier Registry';
  const parse: ContentIdentifierScheme<unknown>['parse'] = (_, v) => v;

  test('Key validation', () => {
    for (const key of [0, 2]) {
      expect(SchemeRegistry.register({ key, parse }, { instanceID })).toBeUndefined();
    }
    for (const key of [2.1, '2.1', '2'] as never[]) {
      expect(() => SchemeRegistry.register({ key, parse }, { instanceID })).toThrow(RegistryError);
    }
  });

  test('Value validation', () => {
    expect(SchemeRegistry.register({ key: 3, parse })).toBeUndefined();
    expect(() => SchemeRegistry.register({ key: 4 } as never)).toThrow(RegistryError);
    expect(() => SchemeRegistry.register({ key: 4, parse: '' } as never)).toThrow(RegistryError);
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
