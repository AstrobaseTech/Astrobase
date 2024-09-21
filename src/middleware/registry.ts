import type { Middleware } from './types.js';

// TODO(feat): We need an Array variant of a Registry
// TODO(feat): Would be nice to filter
const middlewares: Partial<Record<string, Middleware[]>> = {};

/**
 * Retrieves the {@linkcode Middleware}s registered for an instance.
 *
 * @param instanceID The instance to resolve Middlewares for.
 * @returns The Middlewares for the instance.
 */
export function getMiddlewares(instanceID = '') {
  return (middlewares[instanceID] ??= []);
}

/**
 * Registers a {@linkcode Middleware} for an instance.
 *
 * @param middleware The Middleware to register.
 * @param instanceID The instance to register the Middleware for.
 */
export function registerMiddleware(middleware: Middleware, instanceID = '') {
  getMiddlewares(instanceID).push(middleware);
}
