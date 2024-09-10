import type { ContentIdentifier } from '../identifiers/identifiers.js';
import type { MaybePromise } from '../internal/index.js';

/**
 * The interface for a Channel implementation. All functionality is optional to implement. See
 * {@link Channels}
 */
export interface Channel {
  /**
   * A function that handles a delete request.
   *
   * @param id The {@linkcode ContentIdentifier} of the content requested to be deleted.
   * @returns `void`, but if the function is asynchronous it should return a promise that resolves
   *   once the action has been completed.
   */
  delete?(id: ContentIdentifier): MaybePromise<void>;

  /**
   * A function that handles a get request.
   *
   * @param id The {@linkcode ContentIdentifier} of the requested content.
   * @returns The content or a promise that resolves with the content. If the content cannot be
   *   retrieved becuase it doesn't exist or for some other reason, we should return `void`
   *   instead.
   */
  get?(id: ContentIdentifier): MaybePromise<ArrayLike<number> | ArrayBufferLike | void>;

  /**
   * A function that handles a put request (to store an identifier/content pair).
   *
   * @param id The {@linkcode ContentIdentifier}.
   * @param content The content.
   * @returns `void`, but if the function is asynchronous it should return a promise that resolves
   *   once the action has been completed.
   */
  put?(id: ContentIdentifier, content: Uint8Array): MaybePromise<void>;
}
