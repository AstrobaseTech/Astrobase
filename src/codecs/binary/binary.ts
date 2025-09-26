/** @module Codecs/Binary */

import type { Codec } from '../codecs.js';

/**
 * A no-op {@link Codec} for raw binary.
 *
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
export const BinaryCodec: Codec<Uint8Array<ArrayBuffer>> = {
  decode: (v) => v,
  encode: (v) => v,
};
