import type { Identifier } from '../identifiers/identifiers.js';
import type { MaybePromise } from '../internal/index.js';

/**
 * The interface for a Channel implementation. All functionality is optional to implement. See
 * {@link Channels}
 */
export interface Channel {
  /**
   * A function that handles a delete request.
   *
   * @param id The {@linkcode Identifier} of the value requested to be deleted.
   * @returns `void`, but if the function is asynchronous it should return a promise that resolves
   *   once the action has been completed.
   */
  delete?(id: Identifier): MaybePromise<void>;
  /**
   * A function that handles a get request.
   *
   * @param id The identifier of the requested value.
   * @returns The value or a promise that resolves with the value. If the value cannot be retrieved
   *   becuase it doesn't exist or for some other reason, we should return `void` instead.
   */
  get?(id: Identifier): MaybePromise<ArrayLike<number> | ArrayBufferLike | void>;
  /**
   * A function that handles a put request (to store an identifier/value pair).
   *
   * @param id The identifier.
   * @param value The value.
   * @returns `void`, but if the function is asynchronous it should return a promise that resolves
   *   once the action has been completed.
   */
  put?(id: Identifier, value: Uint8Array): MaybePromise<void>;
}
