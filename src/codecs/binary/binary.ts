/**
 * Implements a no-op Codec for raw binary.
 *
 * @module Codecs / Binary
 * @category API Reference
 * @example
 *
 * ```js
 * import BinaryCodec from '@astrobase/sdk/codec/binary';
 * import { Binary } from '@astrobase/sdk/codecs';
 * import createInstance from '@astrobase/sdk/instance';
 *
 * const customInstance = createInstance({ codecs: { [Binary]: BinaryCodec } });
 * ```
 *
 * @experimental
 */

import type { Codec } from '../codecs.js';

/**
 * A no-op {@link Codec} for raw binary.
 *
 * @ignore
 * @example
 *
 * ```js
 * import BinaryCodec from '@astrobase/sdk/codec/binary';
 * import { Binary } from '@astrobase/sdk/codecs';
 * import createInstance from '@astrobase/sdk/instance';
 *
 * const customInstance = createInstance({ codecs: { [Binary]: BinaryCodec } });
 * ```
 */
export const BinaryCodec: Codec<Uint8Array> = {
  decode: (v) => v,
  encode: (v) => v,
};
