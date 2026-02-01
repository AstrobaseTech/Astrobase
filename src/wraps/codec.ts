import type { Codec } from '../codecs/codecs.js';
import type { Unwrapped } from './types.js';
import { unwrap, wrap } from './wraps.js';

/** A {@link Codec} to enable automatic unwrap and validation for wraps. */
export const WrapCodec: Codec<Unwrapped> = {
  decode: async (payload, { instance }) => unwrap(instance, payload),
  encode: async (data, { instance }) => wrap(instance, data),
};
