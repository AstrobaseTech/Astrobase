/**
 * Content Identifiers are keys used to identify and look up content. A Content Identifier is made
 * up of a prefix and a value. The prefix is a short human readable string which indicates what type
 * of Content Identifier it is and therefore what rules the content should follow. The value varies
 * depending on the type of Content Identifier. Content Identifiers use bech32 encoding to represent
 * them as a string.
 *
 * @module CID
 * @category API Reference
 * @experimental
 */

import { bech32m } from 'bech32';
import type { Instance } from '../instance/instance.js';
import type { MaybePromise } from '../internal/index.js';

/**
 * A handler function for parsing and validating a content identifier and content buffer pair.
 *
 * @template T The type returned after a successful parse.
 * @param identifier The {@link ContentIdentifier}.
 * @param content The content buffer.
 * @param instance The instance where the function was called.
 * @returns The parsed value or a promise that resolves with the parsed value. If performing some
 *   validation which fails, instead return `undefined`.
 */
export type ContentIdentifierSchemeParser<T> = (
  identifier: ContentIdentifier,
  content: Uint8Array,
  instance: Instance,
) => MaybePromise<T | undefined>;

/** A valid content identifier value. */
export type ContentIdentifierLike = string | ContentIdentifier;

/** Represents a bech32 content identifier and implements methods for parsing it. */
export class ContentIdentifier {
  private _identifier: string;
  private _prefix: string;
  private _value: ArrayLike<number>;

  constructor(identifierOrPrefix: ContentIdentifierLike, value?: ArrayLike<number>) {
    if (identifierOrPrefix instanceof ContentIdentifier) {
      this._identifier = identifierOrPrefix._identifier;
      this._prefix = identifierOrPrefix._prefix;
      this._value = identifierOrPrefix._value;
    } else if (value) {
      this._identifier = bech32m.encode(identifierOrPrefix, bech32m.toWords(value));
      this._prefix = identifierOrPrefix.toLowerCase();
      this._value = value;
    } else {
      const { prefix, words } = bech32m.decode(identifierOrPrefix);
      this._identifier = identifierOrPrefix.toLowerCase();
      this._prefix = prefix;
      this._value = bech32m.fromWords(words);
    }
  }

  /** The content identifier prefix - indicating the type of the content identifier. */
  get prefix() {
    return this._prefix;
  }

  /** The content identifier value bytes - if any. */
  get value() {
    return this._value;
  }

  /** @returns The full content identifier in string format. */
  toString() {
    return this._identifier;
  }
}
