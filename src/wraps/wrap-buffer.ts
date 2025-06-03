import { encode } from 'varint';
import { Ascii } from '../ascii/ascii.js';
import { FileBuilder } from '../file/file-builder.js';
import { Varint } from '../varint/varint.js';
import type { Wrapped } from './types.js';

/** Deserializes a Wrap buffer, turning it into a {@link Wrapped} object. */
export function fromWrapBuffer(wrapBuffer: ArrayLike<number> | ArrayBufferLike): Wrapped {
  const typedArray = new Uint8Array(wrapBuffer);

  const type = new Ascii(typedArray);

  const mdLengthStart = type.encodingEnd + 1;
  const mdLength = new Varint(typedArray, mdLengthStart);

  const mdStart = mdLengthStart + mdLength.encodingLength;

  const payloadStart = mdStart + mdLength.value;

  return {
    type: type.value,
    metadata: new FileBuilder(typedArray.subarray(mdStart, payloadStart)),
    payload: typedArray.subarray(payloadStart),
  };
}

/** Deserializes a {@link Wrapped} value, turning it into a Wrap buffer. */
export const toWrapBuffer = (wrapped: Wrapped): Uint8Array =>
  new Uint8Array([
    ...new TextEncoder().encode(wrapped.type),
    0,
    ...encode(wrapped.metadata.buffer.length),
    ...wrapped.metadata.buffer,
    ...wrapped.payload,
  ]);
