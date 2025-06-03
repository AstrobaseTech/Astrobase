// prettier-ignore
import { ContentIdentifier, type ContentIdentifierLike, type ContentIdentifierSchemeParser } from '../cid/cid.js';
import type { ContentProcedures } from './procedures.js';
import { getOrThrow, type Instance } from '../instance/instance.js';
import { payloadToBytes } from '../internal/encoding.js';
// prettier-ignore
import { buildQueue, callProcedure, callProcedureAll, filterByProcedure } from '../rpc/client/index.js';

/**
 * Invokes the `content:delete` procedure via all clients that support it.
 *
 * @param cid A valid {@link ContentIdentifierLike} value.
 * @param instance The {@link Instance} config to use.
 * @returns A promise that resolves once all requests are completed.
 */
export async function deleteContent(cid: ContentIdentifierLike, instance: Instance) {
  await Promise.allSettled(
    callProcedureAll(instance, 'content:delete', new ContentIdentifier(cid)),
  );
}

/**
 * Retrieves an item of content.
 *
 * @template T The type of the content after being parsed.
 * @param cid A valid {@link ContentIdentifierLike} value.
 * @param instance The instance to use for this request.
 * @returns A promise that resolves with the parsed content, or `undefined` if nothing acceptable
 *   was found.
 */
export function getContent<T>(cid: ContentIdentifierLike, instance: Instance) {
  return new Promise<T | undefined>((resolve) => {
    cid = new ContentIdentifier(cid);
    const schemeParser = getOrThrow(
      instance,
      'schemes',
      cid.prefix,
    ) as ContentIdentifierSchemeParser<T>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const queue = buildQueue<ContentProcedures>(filterByProcedure(instance.clients, 'content:get'));

    if (!queue.length) {
      resolve(undefined);
    }

    let todo = queue.reduce((count, next) => count + next.length, 0);
    let resolved = false;

    const handleNull = () => {
      if (--todo == 0 && !resolved) {
        resolve(undefined);
      }
    };

    for (const group of queue) {
      for (const strategy of group) {
        callProcedure(instance, strategy, 'content:get', cid)
          .then((content) => {
            if (content) {
              return schemeParser(cid as ContentIdentifier, new Uint8Array(content), instance);
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

/** Additional options for the {@link putContent} API. */
export interface PutOptions {
  /** The instance to use for this request. */
  instance: Instance;

  /**
   * Whether to validate the content and identifier using registered schemes.
   *
   * @default true
   */
  validate?: boolean;
}

/**
 * Saves an item of content. Invokes the `content:put` procedure via all clients that support it.
 *
 * @param cid A valid {@link ContentIdentifierLike} value for the content.
 * @param content The content to save in binary form.
 * @param options Additional {@link PutOptions}.
 * @returns A promise that resolves once all requests are completed.
 */
export async function putContent(
  cid: ContentIdentifierLike,
  content: ArrayLike<number> | ArrayBufferLike | string,
  options: PutOptions,
) {
  cid = new ContentIdentifier(cid);
  content = payloadToBytes(content);
  if (options.validate ?? true) {
    const schemeParser = getOrThrow(options.instance, 'schemes', cid.prefix);
    const parsed = await Promise.resolve(
      schemeParser(cid, content as Uint8Array, options.instance),
    ).catch(() => undefined);
    if (parsed === undefined || parsed === null) {
      throw new TypeError('Content failed validation');
    }
  }
  await Promise.allSettled(
    callProcedureAll(options.instance, 'content:put', { cid, content: content as Uint8Array }),
  );
}
