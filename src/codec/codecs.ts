/** @module Codecs */

import { parse, type MediaType } from 'content-type';
import { validateMediaType } from '../file/media-types.js';
import { stringToBytes, type MaybePromise } from '../internal/index.js';
import { JSONCodec } from '../json/codec.js';
import { Registry, type RegistryModule } from '../registry/registry.js';

/**
 * Additional properties available to codec functions.
 *
 * @category Interfaces
 */
export interface CodecProps {
  /** The instance where the operation is occurring. */
  instanceID?: string;
  /** The media type that the Codec was resolved for. */
  mediaType: MediaType;
}

/**
 * The interface for a Codec module that can be registered in the {@linkcode CodecRegistry}.
 *
 * A codec module provides two functions - `decode` and `encode` - which are used for serialization
 * and deserialization of binary content for one or more media types (also known as MIME types or
 * content types). They may additionally perform validation and throw an error where the content is
 * corrupt or otherwise unacceptable.
 *
 * The codec system is primarily used by the {@linkcode File} protocol.
 *
 * @category Interfaces
 */
export interface Codec<T = unknown> extends RegistryModule<string> {
  /**
   * Decodes bytes into the value.
   *
   * @param payload The bytes to decode.
   * @param props Additional properties that may be needed.
   * @returns The decoded value or a promise that resolves with the decoded value.
   */
  decode(payload: Uint8Array, props: CodecProps): MaybePromise<T>;
  /**
   * Encodes a value to bytes.
   *
   * @param data The value to encode.
   * @param props Additional properties that may be needed.
   * @returns The encoded bytes or a promise that resolves with the encoded bytes.
   */
  encode(data: T, props: CodecProps): MaybePromise<Uint8Array>;
}

/**
 * The {@linkcode Registry} for {@linkcode Codec}s. See {@linkcode Registry} for documentation on using
 * registries.
 *
 * @category Registry
 */
export const CodecRegistry = new Registry<string, Codec>({
  defaults: {
    'application/json': JSONCodec,
    'application/octet-stream': {
      decode: (v) => v,
      encode: (v) => v,
    } satisfies Codec<Uint8Array>,
  },
  validateKey: (key) => validateMediaType(stringToBytes(key)),
  validateModule: (value) =>
    typeof value.decode === 'function' && typeof value.encode === 'function',
});

/**
 * Decodes binary content using the registered {@linkcode Codec} for the given media type and
 * instance ID.
 *
 * @category Functions
 * @template T The type of the decoded content.
 * @param payload The binary content to decode.
 * @param mediaType The media type of the content.
 * @param instanceID The instance ID for {@linkcode Codec} resolution.
 * @returns A promise that resolves with the decoded content of type `T`.
 */
export function decodeWithCodec<T>(
  payload: Uint8Array,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<T> {
  try {
    mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = CodecRegistry.getStrict(mediaType.type, instanceID) as Codec<T>;
    return Promise.resolve(codec.decode(payload, { instanceID, mediaType }));
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Encodes content to binary form using the registered {@linkcode Codec} for the given media type and
 * instance ID.
 *
 * @category Functions
 * @param input The content to encode.
 * @param mediaType The media type of the desired encoding.
 * @param instanceID The instance ID for codec resolution.
 * @returns A promise that resolves with a binary buffer of the encoded content.
 */
export async function encodeWithCodec(
  input: unknown,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<Uint8Array> {
  try {
    mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = CodecRegistry.getStrict(mediaType.type, instanceID);
    return Promise.resolve(codec.encode(input, { instanceID, mediaType }));
  } catch (e) {
    return Promise.reject(e);
  }
}
