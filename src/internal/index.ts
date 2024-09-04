/**
 * Intended for internal use. These APIs are considered unstable.
 *
 * @module Internal
 */

/**
 * A value that may or may not be in Promise form.
 *
 * @category Types
 */
export type MaybePromise<T> = T | Promise<T>;

export * from './encoding.js';
