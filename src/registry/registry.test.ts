import { describe, expect, test } from 'vitest';
import { Registry } from './registry.js';

describe('Registry', () => {
  describe('Get', () => {
    test('Single key', () => {
      const registry = new Registry();
      const key = 1;
      const strategy = {};
      const module = { key, strategy };

      expect(registry.get(key)).toBeUndefined();
      expect(() => registry.getStrict(key)).toThrow('Strategy not found');

      registry.register(module);

      expect(registry.get(key)).toBe(strategy);
      expect(registry.getStrict(key)).toBe(strategy);
    });

    test('Multiple keys', () => {
      const registry = new Registry();
      const key = [1, 2, 3];
      const strategy = {};
      const module = { key, strategy };

      for (const k of key) {
        expect(registry.get(k)).toBeUndefined();
        expect(() => registry.getStrict(k)).toThrow('Strategy not found');
      }

      registry.register(module);

      for (const k of key) {
        expect(registry.get(k)).toBe(strategy);
        expect(registry.getStrict(k)).toBe(strategy);
      }
    });
  });

  describe('Register', () => {
    test('Value validator', () => {
      const registry = new Registry<number, string>({
        validateStrategy: (strategy) => strategy === 'test',
      });

      const validThing = { key: 1, strategy: 'test' };
      expect(() => registry.register(validThing)).not.toThrow();
      expect(registry.get(validThing.key)).toBe(validThing.strategy);

      const invalidThing = { key: 2, strategy: 'invalid' };
      expect(() => registry.register(invalidThing)).toThrow('Invalid strategy');
      expect(registry.get(invalidThing.key)).toBeUndefined();
    });

    test('Key is required', () => {
      const registry = new Registry();
      expect(() => registry.register({ key: 1, strategy: {} })).not.toThrow();
      expect(() => registry.register({ strategy: {} }, { key: 2 })).not.toThrow();
      expect(() => registry.register({ strategy: {} })).toThrow('No key provided');
    });

    test('Key validator', () => {
      const registry = new Registry({
        validateKey: (k) => typeof k === 'number',
      });

      const validThing = { key: 1, strategy: {} };
      expect(() => registry.register(validThing)).not.toThrow();
      expect(registry.get(validThing.key)).toBe(validThing.strategy);

      const invalidThing = { key: '2', strategy: {} };
      expect(() => registry.register(invalidThing)).toThrow('Invalid key');
      expect(registry.get(invalidThing.key)).toBeUndefined();
    });

    test('Key in use and force override', () => {
      const registry = new Registry();
      const oldValue = { key: 1, strategy: {} };
      registry.register(oldValue);
      expect(registry.get(1)).toBe(oldValue.strategy);

      const newValue = { key: 1, strategy: {} };
      expect(() => registry.register(newValue)).toThrow('Key in use');
      expect(() => registry.register(newValue, { force: true })).not.toThrow();
      expect(registry.get(1)).toBe(newValue.strategy);
    });

    test('Instance isolation', () => {
      const registry = new Registry();
      const key = 1;
      const thing1 = { key, strategy: {} };
      const thing2 = { key, strategy: {} };

      expect(registry.get(key)).toBeUndefined();

      registry.register(thing1);

      expect(registry.get(key)).toBe(thing1.strategy);
      expect(registry.get(key, 'a')).toBeUndefined();

      registry.register(thing2, { instanceID: 'a' });

      expect(registry.get(key, 'a')).not.toBe(thing1.strategy);
      expect(registry.get(key, 'a')).toBe(thing2.strategy);
    });

    test('Global', () => {
      const registry = new Registry();
      const key = 1;
      const thing1 = { key, strategy: {} };
      const thing2 = { key, strategy: {} };

      expect(registry.get(key)).toBeUndefined();

      registry.register(thing1, { global: true });

      expect(registry.get(key)).toBe(thing1.strategy);
      expect(registry.get(key, 'a')).toBe(thing1.strategy);

      registry.register(thing2, { instanceID: 'a' });

      expect(registry.get(key, 'a')).not.toBe(thing1.strategy);
      expect(registry.get(key, 'a')).toBe(thing2.strategy);
      expect(registry.get(key)).toBe(thing1.strategy);
    });
  });

  test('Defaults', () => {
    const defaultModule = {};
    const registry = new Registry<number, object>({
      defaults: {
        123: defaultModule,
      },
    });

    expect(registry.get(123)).toBe(defaultModule);
    expect(registry.get(123), 'withAnInstanceID').toBe(defaultModule);
    expect(registry.get(456)).toBeUndefined();

    const instanceID = 'onlyScopedToThisInstance';
    const registerModule = { key: 123, strategy: {} };
    registry.register(registerModule, { instanceID });

    expect(registry.get(123)).not.toBe(registerModule.strategy);
    expect(registry.get(123)).toBe(defaultModule);
    expect(registry.get(123, instanceID)).not.toBe(defaultModule);
    expect(registry.get(123, instanceID)).toBe(registerModule.strategy);

    expect(registry.get(123), 'different').not.toBe(registerModule.strategy);
    expect(registry.get(123), 'different').toBe(defaultModule);
    expect(registry.get(456)).toBeUndefined();
  });
});
