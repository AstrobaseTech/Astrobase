// prettier-ignore
import { integer, minValue, nonEmpty, number, optional, parse, pipe, strictObject, string, unknown } from 'valibot';

/** Base type for RPC messages. */
export interface MessageBase<P extends string> {
  /** The job ID. This is included in the response message to help track requests. */
  jobID: number;

  /** The procedure name. */
  procedure: P;
}

/** Type for an RPC request message. */
export interface RequestMessage<P extends string, T> extends MessageBase<P> {
  /** The request data. */
  payload: T;
}

/** Type for an RPC successful response message. */
export interface OkResponseMessage<P extends string, T> extends MessageBase<P> {
  /** Determines whether this is a success or error response. */
  ok: true;

  /** The result data. */
  payload: T;
}

/** Type for an RPC error response message. */
export interface ErrorResponseMessage<P extends string> extends MessageBase<P> {
  /** Determines whether this is a success or error response. */
  ok: false;

  /** The error message of the response. */
  error?: string;
}

/** Union type for an RPC response message. */
export type ResponseMessage<P extends string, T> =
  | ErrorResponseMessage<P>
  | OkResponseMessage<P, T>;

/** The Valibot schema for RPC `RequestMessage` values. */
export const requestSchema = strictObject({
  jobID: pipe(number(), integer(), minValue(0)),
  procedure: pipe(string(), nonEmpty()),
  payload: optional(unknown()),
});

/**
 * Validates an RPC `RequestMessage` input. If invalid, it throws, otherwise returns the parsed
 * value. Implemented using Valibot.
 *
 * @param input The request message input.
 * @returns The value (validated).
 * @throws If validation fails.
 */
export const validateRequest = (input: unknown) => parse(requestSchema, input);
