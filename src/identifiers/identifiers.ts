/** @module Content Identifiers */

import { Varint } from '../encoding/varint.js';
import { parse } from '../file/parse.js';
import { Immutable } from '../immutable/scheme.js';
import { Base58, type MaybePromise } from '../internal/index.js';
import { Registry } from '../registry/registry.js';

/** A valid content identifier value. When a string is used, it must be base58 encoded. */
export type ContentIdentifierLike =
  | ArrayLike<number>
  | ArrayBufferLike
  | string
  | ContentIdentifier;

/**
 * A handler function for parsing and validating a content identifier and content buffer pair.
 *
 * @template T The type returned after a successful parse.
 * @param identifier The {@linkcode ContentIdentifier}.
 * @param content The content buffer.
 * @param instanceID The ID of the instance where the function was called.
 * @returns The parsed value or a promise that resolves with the parsed value. If performing some
 *   validation which fails, instead return `void`.
 */
export type ContentIdentifierSchemeParser<T> = (
  identifier: ContentIdentifier,
  content: Uint8Array,
  instanceID?: string,
) => MaybePromise<T | void>;

/**
 * Represents a content identifier and implements methods for parsing and encoding it.
 *
 * Content identifiers are the keys used to identify and lookup content. Rather than being
 * arbitrary, the content identifier usually has some form of connection with the content - for
 * instance the content identifier for immutable content includes a hash derived from the content,
 * which is used in consensus validation.
 *
 * Content identifiers are made up of a type integer, serialized as a varint, followed by the value
 * itself, which will vary per type.
 *
 * When presenting a content identifier in human-readable form, we use base58 encoding.
 */
export class ContentIdentifier {
  /** The full bytes. */
  public bytes: Uint8Array;

  constructor(
    /** A valid content identifier. When a string is used, it must be base58 encoded. */
    identifier: ContentIdentifierLike,
  ) {
    this.bytes =
      identifier instanceof ContentIdentifier
        ? identifier.bytes
        : typeof identifier === 'string'
          ? Base58.decode(identifier)
          : new Uint8Array(identifier);
  }

  /** The type integer. */
  get type() {
    return new Varint(this.bytes);
  }

  /** The value as bytes. */
  get rawValue() {
    return this.bytes.subarray(this.type.encodingLength);
  }

  /** Gets a version encoded as human-readable base58 string. */
  toBase58() {
    return Base58.encode(this.bytes);
  }

  /** Alias for `toBase58`. */
  toString() {
    return this.toBase58();
  }
}

/**
 * A {@linkcode Registry} for storing {@linkcode ContentIdentifierSchemeParser} instances and
 * associating them with a type integer.
 */
export const SchemeRegistry = new Registry<number, ContentIdentifierSchemeParser<unknown>>({
  defaults: { 1: Immutable, 2: parse },
  validateKey: (key) => Number.isInteger(key),
  validateStrategy: (strategy) => typeof strategy === 'function',
});
