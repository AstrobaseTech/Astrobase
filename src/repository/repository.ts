/** @module Repository */

import {
  ContentIdentifier,
  SchemeRegistry,
  type ContentIdentifierLike,
  type ContentIdentifierSchemeParser,
} from '../identifiers/identifiers.js';
import { payloadToBytes } from '../internal/encoding.js';
import { allClients, getOrderedClients } from '../rpc/client/client-management.js';

/**
 * Deletes an item of content.
 *
 * @param cid A valid {@linkcode ContentIdentifierLike} value.
 * @param instanceID The instance to use for this request. Omit for the default instance.
 * @returns A promise that resolves once all applicable RPC clients have handled the request.
 */
export async function deleteContent(cid: ContentIdentifierLike, instanceID?: string) {
  await Promise.allSettled(allClients('content:delete', new ContentIdentifier(cid), instanceID));
}

/**
 * Retrieves an item of content.
 *
 * @template T The type of the content after being parsed.
 * @param cid A valid {@linkcode ContentIdentifierLike} value.
 * @param instanceID The instance to use for this request. Omit for the default instance.
 * @returns A promise that resolves with the parsed content, or `void` if nothing acceptable was
 *   found.
 */
export function getContent<T>(cid: ContentIdentifierLike, instanceID?: string) {
  return new Promise<T | void>((resolve) => {
    cid = new ContentIdentifier(cid);
    const schemeParser = SchemeRegistry.getStrict(
      cid.type.value,
    ) as ContentIdentifierSchemeParser<T>;
    const orderedClients = getOrderedClients('content:get', instanceID);
    let todo = orderedClients.reduce((count, next) => count + next.length, 0);
    let resolved = false;

    const handleNull = () => {
      if (--todo == 0 && !resolved) {
        resolve(undefined);
      }
    };

    for (const group of orderedClients) {
      for (const client of group) {
        void client
          .strategy(cid)
          .then((content) => {
            if (content) {
              return schemeParser(cid as ContentIdentifier, new Uint8Array(content), instanceID);
            }
          })
          .then((content) => {
            if (!resolved) {
              if (content === undefined || content === null) {
                handleNull();
              } else {
                resolved = true;
                resolve(content);
              }
            }
          })
          .catch(handleNull);
      }
    }
  });
}

/** Additional options for the {@linkcode putContent} API. */
export interface PutOptions {
  /** The instance to use for this request. Omit for the default instance. */
  instanceID?: string;

  /**
   * Whether to validate the content and identifier using registered schemes.
   *
   * @default true
   */
  validate?: boolean;
}

/**
 * Saves an item of content.
 *
 * @param cid A valid {@linkcode ContentIdentifierLike} value for the content.
 * @param content The content to save.
 * @param options Additional {@linkcode PutOptions}.
 * @returns A promise that resolves once all applicable RPC clients have handled the request.
 */
export async function putContent(
  cid: ContentIdentifierLike,
  content: ArrayLike<number> | ArrayBufferLike | string,
  options?: PutOptions,
) {
  cid = new ContentIdentifier(cid);
  content = payloadToBytes(content);
  if (options?.validate ?? true) {
    const schemeParser = SchemeRegistry.getStrict(cid.type.value);
    const parsed = await Promise.resolve(
      schemeParser(cid, content as Uint8Array, options?.instanceID),
    ).catch(() => undefined);
    if (parsed === undefined || parsed === null) {
      throw new TypeError('Content failed validation');
    }
  }
  await Promise.allSettled(
    allClients('content:put', { cid, content: content as Uint8Array }, options?.instanceID),
  );
}
