import type { MaybePromise } from '../../internal/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as T from '../shared/index.js';
import type { RPCClientConfig } from './types.js';

/**
 * The set of active {@linkcode RPCClientConfig}s.
 *
 * ## Usage
 *
 *     import { clients } from '@astrobase/core/rpc/client';
 *
 *     const myClient = {
 *       // ...
 *     };
 *
 *     // Register the client
 *     clients.add(myClient);
 *
 *     // Unregister the client
 *     clients.delete(myClient);
 *
 * You will need to keep a reference to the {@linkcode RPCClientConfig} object around in order to
 * unregister it later.
 */
export const clients = new Set<RPCClientConfig>();

/**
 * A client that has been filtered and normalised for processing requests of a particular procedure
 * kind.
 *
 * @template T The {@linkcode T.ProcedureConfig} to infer types from.
 * @template P The procedure kind string as a type.
 */
export type FilteredClient<
  T extends T.ProcedureConfig = T.CoreProcedures,
  P extends T.Procedure<T> = T.Procedure<T>,
> = Omit<RPCClientConfig<T>, 'strategy'> & {
  /**
   * The normalised strategy for processing requests of the procedure kind.
   *
   * @param payload The request payload.
   * @returns The response promise.
   */
  strategy(payload: T.ProcedureRequest<T, P>): Promise<T.ProcedureResponse<T, P>>;
};

/**
 * Gets {@linkcode FilteredClient}s for the instance and procedure type. This includes instance
 * scoped and globally scoped clients.
 *
 * @template T The {@linkcode T.ProcedureConfig} to infer types from.
 * @template P The procedure kind string as a type. Used for type inference.
 * @param instanceID The instance to get {@linkcode FilteredClient}s for.
 * @param clientSet The set of {@linkcode RPCClientConfig}s to filter.
 * @returns An array of {@linkcode FilteredClient}s.
 */
export function getFilteredClients<
  T extends T.ProcedureConfig = T.CoreProcedures,
  P extends T.Procedure<T> = T.Procedure<T>,
>(procedure: P, instanceID = '', clientSet = clients) {
  const filteredClients: FilteredClient<T, P>[] = [];
  for (const client of clientSet) {
    let strategy: FilteredClient<T, P>['strategy'];
    if (client.strategy.procedures?.[procedure]) {
      strategy = (payload) =>
        Promise.resolve(
          client.strategy.procedures![procedure](payload, instanceID) as MaybePromise<
            T.ProcedureResponse<T, P>
          >,
        );
    } else if (client.strategy.fallback) {
      strategy = (payload) =>
        Promise.resolve(
          client.strategy.fallback!(procedure, payload, instanceID) as MaybePromise<
            T.ProcedureResponse<T, P>
          >,
        );
    } else {
      continue;
    }
    if (client.instanceID === undefined || client.instanceID === instanceID) {
      filteredClients.push({
        instanceID: client.instanceID,
        priority: client.priority,
        strategy,
      });
    }
  }
  return filteredClients;
}

/**
 * Groups and orders {@linkcode RPCClientConfig}s by their priority. Clients with the same priority
 * are grouped together in the same array.
 *
 * @template T The {@linkcode T.ProcedureConfig} to infer types from.
 * @template P The procedure kind string as a type. Used for type inference.
 * @param procedure The procedure that the clients must support.
 * @param instanceID The instance to filter clients on.
 * @param clientSet Optionally provide a custom set of clients to source from (for testing).
 * @returns An ordered array of {@linkcode RPCClientConfig} arrays.
 */
export function getOrderedClients<
  T extends T.ProcedureConfig = T.CoreProcedures,
  P extends T.Procedure<T> = T.Procedure<T>,
>(procedure: P, instanceID = '', clientSet = clients) {
  const filtered = getFilteredClients<T, P>(procedure, instanceID, clientSet);

  const prioritised: FilteredClient<T, P>[] = [];
  const priorityless: FilteredClient<T, P>[] = [];

  for (const client of filtered) {
    (typeof client.priority === 'number' ? prioritised : priorityless).push(client);
  }

  const orderedClients: FilteredClient<T, P>[][] = [];

  if (prioritised.length) {
    prioritised
      .sort((a, b) => a.priority! - b.priority!)
      .reduce((previous, current) => {
        if (orderedClients.length && previous.priority == current.priority) {
          orderedClients[orderedClients.length - 1].push(current);
        } else {
          orderedClients.push([current]);
        }
        return current;
      });
  }

  for (const client of priorityless) {
    orderedClients.push([client]);
  }

  return orderedClients;
}

/**
 * Asynchronously sends a request to all clients registered for the target instance.
 *
 * @template T The {@linkcode T.ProcedureConfig} to infer types from.
 * @template P The procedure kind string as a type. Used for type inference.
 * @param procedure The procedure type.
 * @param payload The request payload value for the procedure type.
 * @param instanceID The target instance.
 */
export function allClients<
  T extends T.ProcedureConfig = T.CoreProcedures,
  P extends T.Procedure<T> = T.Procedure<T>,
>(procedure: P, payload: T.ProcedureRequest<T, P>, instanceID?: string) {
  return getFilteredClients<T, P>(procedure, instanceID).map((client) => client.strategy(payload));
}
