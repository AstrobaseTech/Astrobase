import { describe, expect, it } from 'vitest';
import { Common } from '../common/common.js';
import { createInstance, maps, sets, type InstanceConfig } from './instance.js';

describe('instance', () => {
  it('Creates blank instance', () => {
    const instance = createInstance();

    for (const key of maps) {
      expect(instance[key]).toEqual({});
    }

    for (const key of sets) {
      expect(instance[key]).toEqual([]);
    }
  });

  it('Creates with common config', () => {
    const instance = createInstance(Common);

    for (const key of maps) {
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

    for (const key of maps.filter((k) => k !== 'procedures')) {
      expect(instance[key]).toEqual(Common[key]);
    }
  });
});
