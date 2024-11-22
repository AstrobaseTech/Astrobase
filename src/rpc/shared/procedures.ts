import type { ContentIdentifier } from '../../identifiers/identifiers.js';

/** An interface that describes the request and response types for a set of procedure kinds. */
export type ProcedureConfig = {
  [k in string]?: [request: unknown, response: unknown];
};

/**
 * A type that derives the union type of all procedure kinds from a {@linkcode ProcedureConfig}.
 *
 * @template T The procedure config.
 */
export type Procedure<T extends ProcedureConfig> = Extract<keyof T, string>;

/**
 * A type that derives the request type of of a procedure kind from a {@linkcode ProcedureConfig}.
 *
 * @template T The procedure config.
 * @template P The procedure kind.
 */
export type ProcedureRequest<T extends ProcedureConfig, P extends Procedure<T>> = T[P] extends [
  infer R,
  ...unknown[],
]
  ? R
  : unknown;

/**
 * A type that derives the response type of of a procedure kind from a {@linkcode ProcedureConfig}.
 *
 * @template T The procedure config.
 * @template P The procedure kind.
 */
export type ProcedureResponse<T extends ProcedureConfig, P extends Procedure<T>> = T[P] extends [
  unknown,
  infer R,
  ...unknown[],
]
  ? R
  : unknown;

/** The {@linkcode ProcedureConfig} for `content:*` procedures. */
export type ContentProcedures = {
  /** The request and response types of the `content:delete` procedure. */
  'content:delete': [ContentIdentifier, void];
  /** The request and response types of the `content:get` procedure. */
  'content:get': [ContentIdentifier, ArrayBuffer | void];
  /** The request and response types of the `content:put` procedure. */
  'content:put': [PutRequestPayload, void];
};

/** The merged {@linkcode ProcedureConfig} type of all procedures provided by the core SDK. */
export type CoreProcedures = ContentProcedures;

/** The payload of a `content:put` request. */
export interface PutRequestPayload {
  /** The {@linkcode ContentIdentifier}. */
  cid: ContentIdentifier;
  /** The content buffer payload. */
  content: Uint8Array;
}
