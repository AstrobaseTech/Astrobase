import { describe, expect, it, test } from 'vitest';
import { Common } from '../common/common.js';
import { createInstance, dicts, sets, type InstanceConfig } from './instance.js';

describe('instance', () => {
  const commonKeys = Object.keys(Common) as (keyof typeof Common)[];

  it('Creates blank instance', () => {
    const instance = createInstance();

    for (const key of dicts) {
      expect(instance[key]).toEqual({});
    }

    for (const key of sets) {
      expect(instance[key]).toEqual([]);
    }
  });

  it('Creates with common config', () => {
    const instance = createInstance(Common);

    for (const key of commonKeys) {
      expect(instance[key]).toEqual(Common[key]);
    }
  });

  it('Creates with common config overrides', () => {
    const customConfig: InstanceConfig = { procedures: { 'content:get': () => undefined } };
    const instance = createInstance(Common, customConfig);

    expect(instance.procedures['content:get']).toBe(customConfig.procedures?.['content:get']);

    for (const key of Object.keys(Common.procedures).filter((k) => k !== 'content:get') as Exclude<
      'content:get',
      keyof typeof Common.procedures
    >[]) {
      expect(instance.procedures[key]).toBe(Common.procedures[key]);
    }

    for (const key of commonKeys.filter((k) => k !== 'procedures')) {
      expect(instance[key]).toEqual(Common[key]);
    }
  });

  test('`dicts` has no duplicate entries', () => {
    expect(new Set(dicts).size).toBe(dicts.length);
  });

  test('`sets` has no duplicate entries', () => {
    expect(new Set(sets).size).toBe(sets.length);
  });

  test('`dicts` & `sets` include all features', () => {
    const combined = new Set<string>([...dicts, ...sets]);

    for (const feature of Object.keys(createInstance())) {
      expect(combined.has(feature));
      combined.delete(feature);
    }

    expect(combined.size).toBe(0);
  });
});
