/**
 * Implements a base `InstanceConfig` that provides implementations for all supported codecs,
 * procedure handlers, hash algorithms, content identifier schemes, and wrap types.
 *
 * This design enables a "batteries included" experience with minimal configuration, while also
 * allowing unparalleled tree-shakability and customisation. Most applications will use the common
 * config as a base, and may use additional configs to extend or even override features. In special
 * cases the config can not be imported into the application at all, and instead a custom config can
 * load only the functionality needed, leaving base functionality to be tree-shaken.
 *
 * @module Common
 * @category API Reference
 * @example
 *
 * ```js
 * import { Common } from '@astrobase/sdk/common';
 * import { createInstance } from '@astrobase/sdk/instance';
 *
 * const instance = createInstance(Common);
 * ```
 *
 * @experimental
 */

import { BinaryCodec } from '../codecs/binary/binary.js';
import { JsonCodec } from '../codecs/json/json.js';
import { deleteContent, getContent, putContent } from '../content/api.js';
import type { PutRequestPayload } from '../content/procedures.js';
import { ECDSA } from '../ecdsa/wrap.js';
import { EncryptWrapModule } from '../encrypt/wrap.js';
import { parseAsFile } from '../file/parse.js';
import { SHA_256, sha256 } from '../hashing/algorithms/sha256.js';
import { prefix as identityPrefix, scheme as identityScheme } from '../identity/identity.js';
import { IMMUTABLE_PREFIX } from '../immutable/repository.js';
import { Immutable } from '../immutable/scheme.js';
import type { InstanceConfig } from '../instance/instance.js';
import { Binary, JSON as JsonMediaType, Wrap } from '../media-types/media-types.js';
import { MUTABLE_PREFIX } from '../mutable/mutable.js';
import { WrapCodec } from '../wraps/codec.js';

/**
 * A base {@link InstanceConfig} that provides implementations for all supported codecs, procedure
 * handlers, hash algorithms, content identifier schemes, and wrap types.
 *
 * This design enables a "batteries included" experience with minimal configuration, while also
 * allowing unparalleled tree-shakability and customisation. Most applications will use the common
 * config as a base, with additional configs extending or even overriding features. In special cases
 * the config can not be imported into the application at all, instead allowing a custom
 * configuration to load only the functionality needed and leaving base functionality to be
 * tree-shaken.
 *
 * @ignore
 * @example
 *
 *     import { Common } from '@astrobase/sdk/common';
 *     import { createInstance } from '@astrobase/sdk/instance';
 *
 *     const instance = createInstance(Common);
 */
export const Common = {
  codecs: {
    [JsonMediaType]: JsonCodec,
    [Binary]: BinaryCodec,
    [Wrap]: WrapCodec,
  },
  procedures: {
    'content:delete': deleteContent,
    'content:get': getContent,
    'content:put': (req, instance) =>
      putContent((req as PutRequestPayload).cid, (req as PutRequestPayload).content, { instance }),
  },
  hashAlgs: {
    [SHA_256]: sha256,
  },
  schemes: {
    [IMMUTABLE_PREFIX]: Immutable,
    [MUTABLE_PREFIX]: parseAsFile,
    [identityPrefix]: identityScheme,
  },
  wraps: {
    ECDSA,
    encrypt: EncryptWrapModule,
  },
} as const satisfies InstanceConfig;
