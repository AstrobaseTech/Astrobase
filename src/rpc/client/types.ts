// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as T from '../shared/index.js';

/**
 * An interface that defines how to make requests to an RPC server.
 *
 * @template T The {@linkcode T.ProcedureConfig} to infer types from.
 */
export interface RPCClientStrategy<T extends T.ProcedureConfig = T.CoreProcedures> {
  /**
   * A fallback function that may be used for any procedure kind, even unknown ones. This is invoked
   * for procedure kinds where a procedure has not been defined in the `procedures` map.
   *
   * @param procedure The procedure kind.
   * @param payload The request payload.
   * @param instanceID The target instance for the request.
   * @returns The response payload promise.
   */
  fallback?(procedure: string, payload: unknown, instanceID?: string): Promise<unknown>;
  /** A map of procedure kinds to their specific implementation function. */
  procedures?: {
    /**
     * The implementation for an individual procedure kind.
     *
     * @template K The procedure kind.
     * @param payload The request payload.
     * @param instanceID The target instance for the request.
     * @returns The response payload promise.
     */
    [K in T.Procedure<T>]: (
      payload: T.ProcedureRequest<T, K>,
      instanceID?: string,
    ) => Promise<T.ProcedureResponse<T, K>>;
  };
}

/**
 * An RPC client configuration.
 *
 * @template T The {@linkcode T.ProcedureConfig} to infer types from.
 */
export interface RPCClientConfig<T extends T.ProcedureConfig = T.ProcedureConfig> {
  /**
   * If specified, the RPC client will be available to this instance only. Otherwise it will be
   * available globally. To restrict to the default instance, use an empty string `''`.
   */
  instanceID?: string;

  /**
   * If specified, the client will be assigned a priority. This is mostly important for enabling
   * asynchronous querying when multiple clients are registered. Clients are queued up and queried
   * synchronously in order of priority, but when multiple clients have the same priority, they are
   * queried asynchronously. Clients without a priority go to the end of the queue and are not
   * queried asynchronously.
   */
  priority?: number;

  /** The strategy for the client. */
  strategy: RPCClientStrategy<T>;
}
