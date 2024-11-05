/** @module Codecs */

import { parse, type MediaType } from 'content-type';
import { validateMediaType } from '../file/media-types.js';
import { stringToBytes, type MaybePromise } from '../internal/index.js';
import {
  BinaryMiddleware,
  getMiddlewares,
  replace,
  revive,
  type Middleware,
} from '../middleware/index.js';
import { Registry } from '../registry/registry.js';

/** Additional properties available to codec functions. */
export interface CodecContext {
  /** The origin instance of invokation. */
  instanceID: string;
  /** The media type that the Codec was resolved for. */
  mediaType: MediaType;
}

/**
 * The interface for a Codec strategy that can be registered in the {@linkcode CodecRegistry}, which
 * makes it available to the File protocol API.
 *
 * A codec strategy provides two functions - `decode` and `encode` - which are used for
 * serialization and deserialization of binary content for one or more media types (also known as
 * MIME types or content types). They may additionally perform validation and throw an error where
 * the content is corrupt or otherwise unacceptable.
 */
export interface Codec<T = unknown> {
  /**
   * Decodes bytes back into the value.
   *
   * @param payload The bytes to decode.
   * @param context Additional properties that may be needed.
   * @returns The decoded value or a promise that resolves with the decoded value.
   * @throws If performing some validation and it fails, an error should be thrown.
   */
  decode(payload: Uint8Array, context: CodecContext): MaybePromise<T>;
  /**
   * Encodes a value to bytes.
   *
   * @param data The value to encode.
   * @param context Additional properties that may be needed.
   * @returns The encoded bytes or a promise that resolves with the encoded bytes.
   * @throws If performing some validation and it fails, an error should be thrown.
   */
  encode(data: T, context: CodecContext): MaybePromise<Uint8Array>;

  /** An optional array of {@linkcode Middleware}s that will be scoped only to this codec instance. */
  middlewares?: Middleware[];
}

/** Media types supported by the SDK by default. */
export const DefaultMediaType = {
  /** The media type for raw binary. */
  Binary: 'application/octet-stream',
  /** The media type for JSON. */
  JSON: 'application/json',
} as const satisfies Record<string, string>;

/** Media types supported by the SDK by default. */
export type TDefaultMediaType = (typeof DefaultMediaType)[keyof typeof DefaultMediaType];

/**
 * The {@linkcode Registry} for {@linkcode Codec}s. Once registered here, Codecs are available to the
 * File API. See {@linkcode Registry} for documentation on using Registry instances.
 */
export const CodecRegistry = new Registry<string, Codec, TDefaultMediaType>({
  defaults: {
    'application/json': {
      decode: (payload) => JSON.parse(new TextDecoder().decode(payload)) as unknown,
      encode: (data) => new TextEncoder().encode(JSON.stringify(data)),
      middlewares: [BinaryMiddleware],
    } satisfies Codec<unknown>,
    'application/octet-stream': {
      decode: (v) => v,
      encode: (v) => v,
    } satisfies Codec<Uint8Array>,
  },
  validateKey: (key) => validateMediaType(stringToBytes(key)),
  validateStrategy: (strategy) =>
    typeof strategy.decode === 'function' &&
    typeof strategy.encode === 'function' &&
    // TODO: validate each middleware?
    (!strategy.middlewares || strategy.middlewares instanceof Array),
});

/**
 * Decodes binary content using the registered {@linkcode Codec} for the given media type and
 * instance.
 *
 * @template T The type of the decoded content.
 * @param payload The binary content to decode.
 * @param mediaType The media type of the content.
 * @param instanceID The target instance for {@linkcode Codec} resolution.
 * @returns A promise that resolves with the decoded content of type `T`.
 */
export async function decodeWithCodec<T>(
  payload: Uint8Array,
  mediaType: string | MediaType,
  instanceID = '',
) {
  mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const codec = CodecRegistry.getStrict(mediaType.type, instanceID) as Codec<T>;
  const middlewares = (codec.middlewares ?? []).concat(getMiddlewares(instanceID));
  const data = await codec.decode(payload, { instanceID, mediaType });
  return revive(data, middlewares, instanceID);
}

/**
 * Encodes content to binary form using the registered {@linkcode Codec} for the given media type and
 * instance.
 *
 * @param input The content to encode.
 * @param mediaType The media type of the desired encoding.
 * @param instanceID The target instance for codec resolution.
 * @returns A promise that resolves with a binary buffer of the encoded content.
 */
export async function encodeWithCodec(
  input: unknown,
  mediaType: string | MediaType,
  instanceID = '',
) {
  mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const codec = CodecRegistry.getStrict(mediaType.type, instanceID);
  const middlewares = getMiddlewares(instanceID).concat(codec.middlewares ?? []);
  input = await replace(input, middlewares, instanceID);
  return codec.encode(input, { instanceID, mediaType });
}
