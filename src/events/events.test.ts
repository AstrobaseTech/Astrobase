import { describe, expect, test, vi } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { emit, off, on } from './events.js';

const generateKeyring = () => ({
  cid: new ContentIdentifier('test', crypto.getRandomValues(new Uint8Array(16))),
});

test('Subscribe', () => {
  const listener = vi.fn();

  on('keyring:change', listener);

  let keyring = generateKeyring();

  emit('keyring:change', keyring);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenLastCalledWith(keyring, undefined);

  keyring = generateKeyring();

  emit('keyring:change', keyring, 'abc');

  expect(listener).toHaveBeenCalledTimes(2);
  expect(listener).toHaveBeenLastCalledWith(keyring, 'abc');
});

describe('Unsubscribe', () => {
  const listener = vi.fn();

  const keyring = generateKeyring();

  test('on -> return fn', () => {
    on('keyring:change', listener)();
    emit('keyring:change', keyring);
    expect(listener).not.toHaveBeenCalled();
  });

  test('off', () => {
    on('keyring:change', listener);
    off('keyring:change', listener);
    emit('keyring:change', keyring);
    expect(listener).not.toHaveBeenCalled();
  });
});
