/** @module Content Identifiers */

import { queryChannelsAsync, queryChannelsSync } from '../channels/channels.js';
import { Varint } from '../encoding/varint.js';
import { Immutable } from '../immutable/schema.js';
import { Base58, type MaybePromise } from '../internal/index.js';
import { Registry, type RegistryModule } from '../registry/registry.js';

/**
 * A valid content identifier value. When a string is used, it must be base58 encoded.
 *
 * @category Content Identifiers
 */
export type ContentIdentifierLike =
  | ArrayLike<number>
  | ArrayBufferLike
  | string
  | ContentIdentifier;

/**
 * Describes a content identifier scheme and defines its handlers.
 *
 * @category Content Identifiers
 * @template T The type returned by the parse function.
 */
export interface ContentIdentifierScheme<T> extends RegistryModule<number> {
  /**
   * Defines a function that takes a identifier/content pair, validates it, and then returns a
   * parsed value. This function can be asynchronous and return a promise.
   *
   * @param identifier The Identifier.
   * @param content The value as bytes.
   * @param instanceID The ID of the instance where the function was called.
   * @returns The parsed value or, if performing some validation which fails, return `void`.
   */
  parse(
    identifier: ContentIdentifier,
    content: Uint8Array,
    instanceID?: string,
  ): MaybePromise<T | void>;
}

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
 *
 * @category Content Identifiers
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
 * A {@linkcode Registry} for storing {@linkcode ContentIdentifierScheme} instances and associating
 * them with a type integer.
 *
 * @category Content Identifiers
 */
export const IdentifierRegistry = new Registry<number, ContentIdentifierScheme<unknown>>({
  defaults: { 1: Immutable },
  validateKey: (key) => Number.isInteger(key),
  validateModule: (value) => typeof value.parse === 'function',
});

/**
 * Sends a delete request to all registered channels asynchronously.
 *
 * @category Repository
 * @param id The identifier of the value to delete.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns A promise that resolves when all requests have completed.
 */
export async function deleteOne(id: ContentIdentifierLike, instanceID?: string) {
  await queryChannelsAsync((channel) => channel.delete?.(new ContentIdentifier(id)), instanceID);
}

/**
 * Queries the registered channels synchronously, and channel groups asynchronously, until we
 * receive a value that passes the {@linkcode ContentIdentifierScheme} validation and parsing. If all
 * channels are queried with no successful result, returns `void`.
 *
 * @category Repository
 * @param id The identifier of the value to get.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns The value or `void` if no valid value was retrieved.
 */
export function getOne<T>(id: ContentIdentifierLike, instanceID?: string) {
  id = new ContentIdentifier(id);
  const scheme = IdentifierRegistry.getStrict(
    id.type.value,
    instanceID,
  ) as ContentIdentifierScheme<T>;
  return queryChannelsSync(async (channel) => {
    const content = await channel.get?.(id);
    if (content) {
      return await Promise.resolve(scheme.parse(id, new Uint8Array(content), instanceID));
    }
  }, instanceID);
}

/**
 * Sends a put request to all channels asynchronously to store an identifier/value pair. The pair
 * will first be validated and, if successful, the requests will be made.
 *
 * @category Repository
 * @param id The identifier.
 * @param value The value.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns A promise that resolves when all requests have completed.
 */
export async function putOne(
  id: ContentIdentifierLike,
  value: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  id = new ContentIdentifier(id);
  value = new Uint8Array(value);
  const identifierSchema = IdentifierRegistry.getStrict(id.type.value, instanceID);
  if (!(await Promise.resolve(identifierSchema.parse(id, value as Uint8Array, instanceID)))) {
    throw new Error('Invalid value');
  }
  await queryChannelsAsync((channel) => channel.put?.(id, value as Uint8Array), instanceID);
}
