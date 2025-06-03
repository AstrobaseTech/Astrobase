/**
 * Implements a Codec for JSON that uses `BinaryMiddleware` to support byte arrays.
 *
 * @module Codecs / JSON
 * @category API Reference
 * @example
 *
 * ```js
 * import JsonCodec from '@astrobase/sdk/codec/json';
 * import { JSON } from '@astrobase/sdk/codecs';
 * import createInstance from '@astrobase/sdk/instance';
 *
 * const customInstance = createInstance({ codecs: { [JSON]: JsonCodec } });
 * ```
 *
 * @experimental
 */

import { BinaryMiddleware } from '../../middleware/binary.js';
import type { Codec } from '../codecs.js';

/**
 * A {@link Codec} for JSON that uses {@link BinaryMiddleware} to support byte arrays.
 *
 * @ignore
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
