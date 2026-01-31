import { expect, test } from 'vitest';
import { SHA_256 } from '../hashing/index.js';
import { createInstance, getOrThrow } from '../instance/instance.js';
import { prefix as identityPrefix } from '../identity/identity.js';
import { IMMUTABLE_PREFIX } from '../immutable/repository.js';
import { Binary, JSON, Wrap } from '../media-types/media-types.js';
import { MUTABLE_PREFIX } from '../mutable/mutable.js';
import { Common } from './common.js';

test('Common config', () => {
  const instance = createInstance(Common);

  expect(() => getOrThrow(instance, 'codecs', Binary)).not.toThrow();
  expect(() => getOrThrow(instance, 'codecs', JSON)).not.toThrow();
  expect(() => getOrThrow(instance, 'codecs', Wrap)).not.toThrow();

  expect(() => getOrThrow(instance, 'hashAlgs', SHA_256)).not.toThrow();

  expect(() => getOrThrow(instance, 'procedures', 'content:delete')).not.toThrow();
  expect(() => getOrThrow(instance, 'procedures', 'content:get')).not.toThrow();
  expect(() => getOrThrow(instance, 'procedures', 'content:put')).not.toThrow();

  expect(() => getOrThrow(instance, 'schemes', IMMUTABLE_PREFIX)).not.toThrow();
  expect(() => getOrThrow(instance, 'schemes', MUTABLE_PREFIX)).not.toThrow();
  expect(() => getOrThrow(instance, 'schemes', identityPrefix)).not.toThrow();

  expect(() => getOrThrow(instance, 'wraps', 'ECDSA')).not.toThrow();
  expect(() => getOrThrow(instance, 'wraps', 'crypt')).not.toThrow();
});
