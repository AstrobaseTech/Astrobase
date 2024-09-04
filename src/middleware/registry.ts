import { BinaryMiddleware } from './binary.js';
import type { CodecMiddleware } from './types.js';

const middlewares: Partial<Record<string, CodecMiddleware[]>> = {};

/**
 * Retrieves the {@linkcode CodecMiddleware}s registered for an instance.
 *
 * @param instanceID The instance to resolve Middlewares for.
 * @returns The Middlewares for the instance.
 */
export function getMiddlewares(instanceID = '') {
  return (middlewares[instanceID] ??= [BinaryMiddleware]);
}

/**
 * Registers a {@linkcode CodecMiddleware} for an instance.
 *
 * @param middleware The Middleware to register.
 * @param instanceID The instance to register the Middleware for.
 */
export function registerMiddleware(middleware: CodecMiddleware, instanceID = '') {
  getMiddlewares(instanceID).push(middleware);
}
