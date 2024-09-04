/**
 * Identifier schemas tell the engine how to handle the different types of data that enter the
 * engine by providing validation and serialization. They deal with binary content and allow for
 * higher level protocols and abstractions to be built on top.
 *
 * @module Identifiers
 */

import { decode, encode, encodingLength } from 'varint';
import { queryChannelsAsync, queryChannelsSync } from '../channels/channels.js';
import { Immutable } from '../immutable/schema.js';
import { Base58, type MaybePromise } from '../internal/index.js';
import { Registry, type RegistryModule } from '../registry/registry.js';

/**
 * This interface describes an identifier type and how the application should handle those
 * identifiers and associated values as they come into the engine and out through channels.
 *
 * @category Identifiers
 */
export interface IdentifierSchema<T = unknown> extends RegistryModule<number> {
  /**
   * Defines a function that takes a identifier/value pair, validates it, and then returns a parsed
   * value. It can be asynchronous and return a promise.
   *
   * @param identifier The Identifier.
   * @param value The value as bytes.
   * @param instanceID The ID of the instance where the function was called.
   * @returns The parsed value or, if performing some validation which fails, return `void`.
   */
  parse(identifier: Identifier, value: Uint8Array, instanceID?: string): MaybePromise<T | void>;
}

/**
 * This class represents an Identifier and implements methods for parsing and encoding it.
 *
 * Identifiers are keys, such as CIDs, which are used to identify and lookup content. Many times the
 * identifier is not arbitrary and has some form of connection with the content - for instance a CID
 * type identifier contains a hash derived from the content.
 *
 * Identifiers are made up of a type integer, serialized as a varint, followed by the identifier
 * value, which will vary per type.
 *
 * ```text
 * +------+-------+
 * | type | value |
 * +------+-------+
 * ```
 *
 * When presenting an Identifier in human-readable form, we use base58 encoding.
 */
export class Identifier {
  /** The full encoded bytes of the Identifier. */
  readonly bytes: Uint8Array;

  constructor(type: number, value: ArrayLike<number> | ArrayBufferLike);
  constructor(identifier: ArrayLike<number> | ArrayBufferLike | string | Identifier);
  constructor(
    arg1: ArrayLike<number> | ArrayBufferLike | number | string | Identifier,
    arg2?: ArrayLike<number> | ArrayBufferLike,
  ) {
    switch (typeof arg1) {
      case 'number':
        this.bytes = new Uint8Array([...encode(arg1), ...new Uint8Array(arg2!)]);
        break;
      case 'string':
        this.bytes = new Uint8Array(Base58.decode(arg1));
        break;
      default:
        this.bytes = arg1 instanceof Identifier ? arg1.bytes : new Uint8Array(arg1);
    }
  }

  /** The type integer of the Identifier. */
  get type() {
    return decode(this.bytes);
  }

  /** The value of the Identifier. */
  get value() {
    return this.bytes.subarray(encodingLength(this.type));
  }

  /** Gets the Identifier encoded as human-readable base58 string. */
  toBase58() {
    return Base58.encode(this.bytes);
  }

  /** Gets a string representation of the Identifier that the binary middleware can parse. */
  toString() {
    return `$ref:b58:${this.toBase58()}`;
  }
}

/**
 * A {@linkcode Registry} for storing {@linkcode IdentifierSchema} instances and associating them with
 * a type integer.
 *
 * @category Identifiers
 */
export const IdentifierRegistry = new Registry<number, IdentifierSchema>({
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
export async function deleteOne(
  id: ArrayLike<number> | ArrayBufferLike | string | Identifier,
  instanceID?: string,
) {
  await queryChannelsAsync((channel) => channel.delete?.(new Identifier(id)), instanceID);
}

/**
 * Queries the registered channels synchronously, and channel groups asynchronously, until we
 * receive a value that passes the {@linkcode IdentifierSchema} validation and parsing. If all
 * channels are queried with no successful result, returns `void`.
 *
 * @category Repository
 * @param id The identifier of the value to get.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns The value or `void` if no valid value was retrieved.
 */
export function getOne<T>(
  id: ArrayLike<number> | ArrayBufferLike | string | Identifier,
  instanceID?: string,
) {
  id = new Identifier(id);
  const schema = IdentifierRegistry.getStrict(id.type, instanceID) as IdentifierSchema<T>;
  return queryChannelsSync(async (channel) => {
    const content = await channel.get?.(id);
    if (content) {
      return await Promise.resolve(schema.parse(id, new Uint8Array(content), instanceID));
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
  id: ArrayLike<number> | ArrayBufferLike | string | Identifier,
  value: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  id = new Identifier(id);
  value = new Uint8Array(value);
  const identifierSchema = IdentifierRegistry.getStrict(id.type, instanceID);
  if (!(await Promise.resolve(identifierSchema.parse(id, value as Uint8Array, instanceID)))) {
    throw new Error('Invalid value');
  }
  await queryChannelsAsync((channel) => channel.put?.(id, value as Uint8Array), instanceID);
}
