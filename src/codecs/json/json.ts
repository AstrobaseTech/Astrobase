/** @module Codecs/JSON */

import { BinaryMiddleware } from '../../middleware/binary.js';
import type { Codec } from '../codecs.js';

/**
 * A {@link Codec} for JSON that uses {@link BinaryMiddleware} to support byte arrays.
 *
 * @example
 *
 * ```js
 * import JsonCodec from '@astrobase/sdk/codec/json';
 * import { JSON } from '@astrobase/sdk/codecs';
 * import createInstance from '@astrobase/sdk/instance';
 *
 * const customInstance = createInstance({ codecs: { [JSON]: JsonCodec } });
 * ```
 */
export const JsonCodec: Codec = {
  decode: (payload) => JSON.parse(new TextDecoder().decode(payload)) as unknown,
  encode: (data) => new TextEncoder().encode(JSON.stringify(data)),
  middlewares: [BinaryMiddleware],
};
