/** @module Codecs */

import { getOrThrow, type Instance } from '../instance/instance.js';
import type { MaybePromise } from '../internal/index.js';
// prettier-ignore
import { normalizeMediaType, type MediaType, type MediaTypeLike } from '../media-types/media-types.js';
import { replace, revive, type Middleware } from '../middleware/index.js';

/**
 * Additional properties available to codec functions.
 *
 * @category Interfaces
 */
export interface CodecContext {
  /** The instance given when invoking the Codec function. */
  instance: Instance;
  /** The media type that the Codec was resolved for. */
  mediaType: MediaType;
}

/**
 * The interface for a Codec. It provides serialization and deserialization to/from binary format.
 *
 * @category Interfaces
 */
export interface Codec<T = unknown> {
  /**
   * A function that deserializes from the binary format. The function should also validate the
   * data. If the data cannot be deserialized or is invalid, an error should be thrown.
   *
   * @param payload The bytes to deserialize.
   * @param context Additional properties that may be needed.
   * @returns The deserialized value. Can be in promise form.
   * @throws If the data cannot be deserialized or is invalid, an error should be thrown.
   */
  decode(payload: Uint8Array<ArrayBuffer>, context: CodecContext): MaybePromise<T>;
  /**
   * A function that serializes to the binary format. The function should also validate the data. If
   * the data cannot be serialized or is invalid, an error should be thrown.
   *
   * @param data The value to serialize.
   * @param context Additional properties that may be needed.
   * @returns The serialized bytes. Can be in promise form.
   * @throws If the data cannot be serialized or is invalid, an error should be thrown.
   */
  encode(data: T, context: CodecContext): MaybePromise<Uint8Array<ArrayBuffer>>;

  /**
   * An optional array of {@link Middleware}s that will be scoped only to this codec. Codec-scoped
   * middlewares are executed in order _before_ Instance-scoped middleware when decoding, and
   * _after_ Instance-scoped middleware when encoding.
   */
  middlewares?: Middleware[];
}

/**
 * Decodes binary data using the {@link Codec} for the media type, plus {@link Middleware}s, provided
 * by the instance.
 *
 * @category Functions
 * @param instance The instance that provides the {@link Codec} & {@link Middleware}s.
 * @param binary The binary data to decode.
 * @param mediaType The media type of the data.
 * @returns A promise that resolves with the decoded data. As we cannot anticipate how registered
 *   middleware will behave, the type of the output will be unknown. You will need to assert the
 *   output type yourself.
 */
export async function decodeWithCodec(
  instance: Instance,
  binary: Uint8Array<ArrayBuffer>,
  mediaType: MediaTypeLike,
) {
  mediaType = normalizeMediaType(mediaType);
  const codec = getOrThrow(instance, 'codecs', mediaType.type);
  const middlewares = (codec.middlewares ?? []).concat(instance.middlewares);
  const data = await codec.decode(binary, { instance, mediaType });
  return revive(instance, data, middlewares);
}

/**
 * Encodes data into binary using the {@link Codec} for the media type, plus {@link Middleware}s,
 * provided by the instance.
 *
 * @category Functions
 * @param instance The instance that provides the {@link Codec} & {@link Middleware}s.
 * @param input The data to encode.
 * @param mediaType The media type of the encoding.
 * @returns A promise that resolves with the encoded binary.
 */
export async function encodeWithCodec(
  instance: Instance,
  input: unknown,
  mediaType: MediaTypeLike,
) {
  mediaType = normalizeMediaType(mediaType);
  const codec = getOrThrow(instance, 'codecs', mediaType.type);
  const middlewares = instance.middlewares.concat(codec.middlewares ?? []);
  input = await replace(instance, input, middlewares);
  return codec.encode(input, { instance, mediaType });
}
