/** An interface that describes the request and response types for a set of procedure kinds. */
export type ProcedureTypes = {
  [K in string]?: [request: unknown, response: unknown];
};

/**
 * A type that derives the union type of all procedure names from a {@link ProcedureTypes}.
 *
 * @template T The procedure types for type inference.
 */
export type ProcedureName<T extends ProcedureTypes> = Extract<keyof T, string>;

/**
 * A type that derives the request type of a procedure from a {@link ProcedureTypes}.
 *
 * @template T The procedure types for type inference.
 * @template P The procedure name.
 */
export type ProcedureRequest<T extends ProcedureTypes, P extends ProcedureName<T>> = T[P] extends [
  infer R,
  ...unknown[],
]
  ? R
  : unknown;

/**
 * A type that derives the response type of a procedure from a {@link ProcedureTypes}.
 *
 * @template T The procedure types for type inference.
 * @template P The procedure name.
 */
export type ProcedureResponse<T extends ProcedureTypes, P extends ProcedureName<T>> = T[P] extends [
  unknown,
  infer R,
  ...unknown[],
]
  ? R
  : unknown;
