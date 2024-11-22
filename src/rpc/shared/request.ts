// prettier-ignore
import { integer, minValue, nonEmpty, number, object, optional, parse, pipe, string, unknown } from 'valibot';

/** The Valibot schema for RPC `RequestMessage` values. */
export const requestMessageSchema = object({
  /** The requested instance ID. */
  instanceID: optional(string()),

  /** The job ID. This is included in the response message to help track requests. */
  jobID: pipe(number(), integer(), minValue(0)),

  /** The requested procedure. */
  procedure: pipe(string(), nonEmpty()),

  /** Request payload, type varying depending on procedure. */
  payload: unknown(),
});

/**
 * Validates an RPC `RequestMessage` input. If invalid, it throws, otherwise returns the parsed
 * value. Implemented using Valibot.
 *
 * @param input The request message input.
 * @returns The value (parsed).
 * @throws If validation fails.
 */
export const validateRequest = (input: unknown) => parse(requestMessageSchema, input);
