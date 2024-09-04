/** @module JSON */

import type { Codec } from '../codec/codecs.js';
import { getMiddlewares, type CodecMiddleware } from '../middleware/index.js';

/** A JSON codec for the `application/json` media type. */
export const JSONCodec = {
  /** This codec is for `application/json` the media type. */
  key: 'application/json' as const,

  /** Decodes a UTF-8 string buffer into a JavaScript value. */
  decode(payload, props) {
    const refTrack = new Set();
    const parsed = JSON.parse(new TextDecoder().decode(payload)) as unknown;
    return Promise.resolve(
      replace(getMiddlewares(props.instanceID), 'reviver', props.instanceID, refTrack, parsed),
    );
  },

  /** Encodes a JavaScript value into a UTF-8 string buffer. */
  async encode(data, props) {
    const refTrack = new Set();
    const replaced = await replace(
      getMiddlewares(props.instanceID),
      'replacer',
      props.instanceID,
      refTrack,
      structuredClone(data),
    );
    return new TextEncoder().encode(JSON.stringify(replaced));
  },
} satisfies Codec;

// TODO: move to middleware module
async function replace(
  plugins: CodecMiddleware[],
  fn: keyof CodecMiddleware,
  instanceID: string | undefined,
  refTrack: Set<unknown>,
  value: unknown,
  key?: string | number,
): Promise<unknown> {
  if (refTrack.has(value)) {
    throw new ReferenceError('Circular reference');
  }
  for (const plugin of plugins) {
    const func = plugin[fn];
    if (func) {
      value = await Promise.resolve(func(key, value, { instanceID }));
    }
  }
  if (value instanceof Array) {
    refTrack.add(value);
    value = await Promise.all(
      value.map((entry, index) => replace(plugins, fn, instanceID, refTrack, entry, index)),
    );
  } else if (value !== null && typeof value === 'object') {
    refTrack.add(value);
    for (const key of Object.keys(value)) {
      (value as Record<string, unknown>)[key] = await replace(
        plugins,
        fn,
        instanceID,
        refTrack,
        (value as Record<string, unknown>)[key],
        key,
      );
    }
  }
  refTrack.delete(value);
  return value;
}
