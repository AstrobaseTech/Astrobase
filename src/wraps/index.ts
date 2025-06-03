/**
 * Implementation for "wraps" - a serialization protocol for "wrapped" data.
 *
 * Examples of wrapped data includes encrypted or signed data. Note that Wraps themselves can be
 * wrapped, so content could be encrypted and then signed, etc.
 *
 * This module exposes an API for processing Wrap values and transforming them across three
 * different states, which are `WrappedBuffer`, `Wrapped`, & `Unwrapped`.
 *
 * - **`WrapBuffer`:** A serialized wrapped value, existing as a buffer.
 * - **`Wrapped`:** A deserialized wrapped value, existing as a JS object.
 * - **`Unwrapped`:** An unwrapped value, existing as a JS object.
 *
 * This module also provides a Codec to enable automatic unwrap and verification for Wraps embedded
 * in Files.
 *
 * The wrap system is flexible and can be extended via the instance config.
 *
 * @module Wraps
 * @category API Reference
 * @experimental
 */

export * from './codec.js';
export * from './types.js';
export * from './wrap-buffer.js';
export * from './wraps.js';
