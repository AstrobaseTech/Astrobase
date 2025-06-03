import type { Instance } from '../instance/instance.js';
import type { Middleware } from './types.js';

/**
 * Perform a recursive replace on a value using the middlewares provided or pre-registered.
 *
 * @param instance The instance for middleware resolution. Also provided to the middleware as
 *   context.
 * @param data The data to recursively walk and replace.
 * @param middlewares An optional array of additional middlewares to use.
 * @returns A promise that resolves with the post-processed value.
 */
export const replace = (instance: Instance, data: unknown, middlewares?: Middleware[]) =>
  initSwap('replacer', data, instance, middlewares);

/**
 * Perform a recursive revive on a value using the middlewares provided or pre-registered.
 *
 * @param instance The instance for middleware resolution. Also provided to the middleware as
 *   context.
 * @param data The data to recursively walk and revive.
 * @param middlewares An optional array of additional middlewares to use.
 * @returns A promise that resolves with the post-processed value.
 */
export const revive = (instance: Instance, data: unknown, middlewares?: Middleware[]) =>
  initSwap('reviver', data, instance, middlewares);

/** Begin recursive {@link swap} for value root. */
function initSwap(
  fn: keyof Middleware,
  data: unknown,
  instance: Instance,
  middlewares = instance.middlewares,
) {
  const refTrack = new Set();
  return swap(middlewares, fn, instance, refTrack, data);
}

/** Recursive swap, walking object and array values. */
async function swap(
  middlewares: Middleware[],
  fn: keyof Middleware,
  instance: Instance,
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
        value = await Promise.resolve(middleware[fn](key, value, instance));
      }

      // Recurse on arrays and simple objects
      if (typeof value === 'object' && value !== null) {
        if (refTrack.has(value)) {
          throw new ReferenceError('Circular reference');
        }

        if (value instanceof Array) {
          refTrack.add(value);
          value = await Promise.all(
            value.map((entry, index) => swap(middlewares, fn, instance, refTrack, entry, index)),
          );
        } else if (Object.getPrototypeOf(value) === Object.prototype) {
          refTrack.add(value);
          const oldObj = value;
          value = {};
          for (const key of Object.keys(oldObj)) {
            (value as Record<string, unknown>)[key] = await swap(
              middlewares,
              fn,
              instance,
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
