import { expect, test } from 'vitest';
import { createRequestMessage } from './create-request-message.js';

test('createRequestMessage', () => {
  for (let i = 0; i < 10; i++) {
    const procedure = i.toString();
    expect(createRequestMessage(procedure, i)).toEqual({ jobID: i, procedure, payload: i });
  }
});
