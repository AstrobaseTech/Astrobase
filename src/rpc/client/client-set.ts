import type { Instance } from '../../instance/instance.js';
import type { ProcedureName, ProcedureTypes, ProcedureRequest } from '../shared/procedures.js';
import { callProcedure, supportsProcedure, type ClientStrategy } from './client-strategy.js';

/**
 * A config for an RPC client.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 */
export interface ClientConfig<T extends ProcedureTypes> {
  /**
   * Assigns a priority to this client for async querying. Clients are queued up and queried
   * one-after-the-other in order of priority, but when multiple callers have the same priority,
   * they are queried simultaneously. Callers without a priority go to the end of the queue and are
   * queried synchronously.
   */
  priority?: number;

  /** The {@link ClientStrategy}. */
  strategy: ClientStrategy<T>;
}

/**
 * Filters a client set to only those that support a procedure.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 * @param clientSet The client set.
 * @param procedure The name of the procedure to filter on.
 * @returns A new filtered client set.
 */
export const filterByProcedure = <T extends ProcedureTypes>(
  clientSet: ClientConfig<T>[],
  procedure: ProcedureName<T>,
) => clientSet.filter(({ strategy }) => supportsProcedure(strategy, procedure));

/**
 * Build a queue by grouping and ordering a client set according to priority. Clients with the same
 * priority are grouped together in the same array.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 * @param clientSet The client set.
 * @returns An ordered array of {@link ClientStrategy} arrays.
 */
export function buildQueue<T extends ProcedureTypes>(clientSet: ClientConfig<T>[]) {
  const prioritised: (ClientConfig<T> & { priority: number })[] = [];
  const priorityless: ClientConfig<T>[] = [];

  for (const client of clientSet) {
    (typeof client.priority === 'number' ? prioritised : priorityless).push(client);
  }

  const queue: ClientStrategy<T>[][] = [];

  switch (prioritised.length) {
    case 1:
      queue.push([prioritised[0].strategy]);
    // eslint-disable-next-line no-fallthrough
    case 0:
      break;
    default:
      prioritised
        .sort((a, b) => a.priority - b.priority)
        .reduce((previous, current, i) => {
          if (i == 1) {
            queue.push([previous.strategy]);
          }
          if (previous.priority == current.priority) {
            queue.at(-1)?.push(current.strategy);
          } else {
            queue.push([current.strategy]);
          }
          return current;
        });
      break;
  }

  for (const client of priorityless) {
    queue.push([client.strategy]);
  }

  return queue;
}

/**
 * Asynchronously sends a request to all clients registered for the target instance.
 *
 * @template T The {@link ProcedureTypes} to infer types from.
 * @template P The procedure name string as a type. Used for type inference.
 * @param instance The target instance.
 * @param procedure The procedure type.
 * @param request The request data.
 */
export const callProcedureAll = <T extends ProcedureTypes, P extends ProcedureName<T>>(
  instance: Instance,
  procedure: P,
  request: ProcedureRequest<T, P>,
) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  filterByProcedure<T>(instance.clients, procedure).map(({ strategy }) =>
    callProcedure(instance, strategy, procedure, request),
  );
