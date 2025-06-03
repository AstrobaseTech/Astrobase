import { expect, test } from 'vitest';
import { validateRequest } from './messages.js';

test('validateMessage', () => {
  for (const [message, valid] of [
    [{}, false],
    [{ procedure: 'abc' }, false],
    [{ procedure: 'abc', jobID: 123, payload: {} }, true],
    [{ procedure: 'abc', jobID: 123 }, true],
    [{ procedure: 'abc', jobID: 123, extra: 'extra' }, false],
  ]) {
    const exp = expect(() => validateRequest(message));
    (valid ? exp.not : exp).toThrow();
  }
});
