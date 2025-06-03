// prettier-ignore
import type { ProcedureName, ProcedureTypes, ProcedureRequest, RequestMessage } from '../shared/index.js';

let i = -1;

const increment = () => (i == Number.MAX_SAFE_INTEGER ? (i = 0) : ++i);

/**
 * Creates a {@link RequestMessage} and assigns a job ID.
 *
 * @param procedure The procedure name.
 * @param payload The request data.
 * @returns The {@link RequestMessage}.
 */
export const createRequestMessage = <
  C extends ProcedureTypes,
  P extends ProcedureName<C>,
  R extends ProcedureRequest<C, P>,
>(
  procedure: P,
  payload: R,
): RequestMessage<P, R> => ({
  jobID: increment(),
  payload,
  procedure,
});
