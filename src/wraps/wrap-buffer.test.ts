import { expect, test } from 'vitest';
import { FileBuilder } from '../file/file-builder.js';
import type { Wrapped } from './types.js';
import { fromWrapBuffer, toWrapBuffer } from './wrap-buffer.js';

test('Wrap buffer', () => {
  const encoder = new TextEncoder();

  const wrapped: Wrapped = {
    type: 'thisismywraptype',
    metadata: new FileBuilder(encoder.encode('thisismymetadata')),
    payload: encoder.encode('thisismypayload'),
  };

  const buffer = toWrapBuffer(wrapped);

  expect(buffer.length).toBe(49);

  expect(fromWrapBuffer(buffer)).toEqual(wrapped);
});
