/**
 * A value that may or may not be in Promise form.
 *
 * @category MaybePromise
 */
export type MaybePromise<T> = T | Promise<T>;
