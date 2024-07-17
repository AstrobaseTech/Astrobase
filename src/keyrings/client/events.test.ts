import { expect, test } from 'vitest';
import { ACTIVE_KEYRING_CHANGE, emit, subscribe } from './events.js';

test('Events', () => {
  let i = 0;
  let j = 0;

  subscribe(ACTIVE_KEYRING_CHANGE, (keyring, instanceID) => {
    expect(!instanceID || instanceID === 'abc').toBe(true);
    expect(keyring?.id).toBe(instanceID ? 1 : 0);
    instanceID ? j++ : i++;
  });

  emit(ACTIVE_KEYRING_CHANGE, { id: 0 });
  emit(ACTIVE_KEYRING_CHANGE, { id: 1 }, 'abc');

  expect(i).toBe(1);
  expect(j).toBe(1);
});
