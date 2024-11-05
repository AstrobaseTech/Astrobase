import { getMiddlewares } from './registry.js';
import type { Middleware } from './types.js';

/**
 * Perform a recursive replace on a value using the middlewares provided or pre-registered.
 *
 * @param data The data to recursively walk and replace.
 * @param middlewares An optional array of middlewares to use. If omitted then registered
 *   middlewares are used.
 * @param instanceID The instance for middleware resolution. Also provided to the middleware as
 *   context.
 * @returns A promise that resolves with the post-processed value.
 */
export const replace = (data: unknown, middlewares?: Middleware[], instanceID = '') =>
  initSwap('replacer', data, instanceID, middlewares);

/**
 * Perform a recursive revive on a value using the middlewares provided or pre-registered.
 *
 * @param data The data to recursively walk and revive.
 * @param middlewares An optional array of middlewares to use. If omitted then registered
 *   middlewares are used.
 * @param instanceID The instance for middleware resolution. Also provided to the middleware as
 *   context.
 * @returns A promise that resolves with the post-processed value.
 */
export const revive = (data: unknown, middlewares?: Middleware[], instanceID = '') =>
  initSwap('reviver', data, instanceID, middlewares);

/** Begin recursive {@linkcode swap} for value root. */
function initSwap(
  fn: keyof Middleware,
  data: unknown,
  instanceID = '',
  middlewares = getMiddlewares(instanceID),
) {
  const refTrack = new Set();
  return swap(middlewares, fn, instanceID, refTrack, data);
}

/** Recursive swap, walking object and array values. */
async function swap(
  middlewares: Middleware[],
  fn: keyof Middleware,
  instanceID: string,
  refTrack: Set<unknown>,
  value: unknown,
  key?: string | number,
): Promise<unknown> {
  // Skip over some primitive types
  switch (typeof value) {
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'undefined':
      break;

    default: {
      if (value === null) {
        break;
      }

      // Execute middleware
      for (const middleware of middlewares) {
        const func = middleware[fn];
        if (func) {
          value = await Promise.resolve(func(key, value, { instanceID }));
        }
      }

      // Recurse on arrays and simple objects
      if (typeof value === 'object' && value !== null) {
        if (refTrack.has(value)) {
          throw new ReferenceError('Circular reference');
        }

        if (value instanceof Array) {
          refTrack.add(value);
          value = await Promise.all(
            value.map((entry, index) => swap(middlewares, fn, instanceID, refTrack, entry, index)),
          );
        } else if (Object.getPrototypeOf(value) === Object.prototype) {
          refTrack.add(value);
          const oldObj = value;
          value = {};
          for (const key of Object.keys(oldObj)) {
            (value as Record<string, unknown>)[key] = await swap(
              middlewares,
              fn,
              instanceID,
              refTrack,
              (oldObj as Record<string, unknown>)[key],
              key,
            );
          }
        }

        refTrack.delete(value);
      }
    }
  }

  return value;
}
