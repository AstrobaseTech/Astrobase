import { expect, test } from 'vitest';
import { ACTIVE_KEYRING_CHANGE, emit, subscribe } from './events.js';

test('Events', () => {
  let iteratorA = 0;
  let iteratorB = 0;

  const cidA = new Uint8Array();
  const cidB = new Uint8Array();

  subscribe(ACTIVE_KEYRING_CHANGE, (keyring, instanceID) => {
    expect(!instanceID || instanceID === 'abc').toBe(true);
    expect(keyring?.cid).toBe(instanceID ? cidB : cidA);
    instanceID ? iteratorB++ : iteratorA++;
  });

  emit(ACTIVE_KEYRING_CHANGE, { cid: cidA });
  emit(ACTIVE_KEYRING_CHANGE, { cid: cidB }, 'abc');

  expect(iteratorA).toBe(1);
  expect(iteratorB).toBe(1);
});
