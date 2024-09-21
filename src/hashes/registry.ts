import { Registry } from '../registry/registry.js';
import { HashAlgorithm, sha256 } from './algorithms.js';
import type { HashFn } from './types.js';

/** The {@linkcode Registry} for hash functions. */
export const HashFnRegistry = new Registry<number, HashFn, HashAlgorithm>({
  defaults: {
    [HashAlgorithm.SHA256]: sha256,
  },
  validateKey: (key) => typeof key === 'number',
  validateStrategy: (module) => typeof module === 'function',
});
