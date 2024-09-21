/** Base type for RPC messages. */
export interface MessageBase<P extends string> {
  /** The origin instance of the request. */
  instanceID?: string;
  /** The ID of the request. */
  jobID: number;
  /** The request procedure type. */
  procedure: P;
}

/** Type for an RPC request message. */
export interface RequestMessage<P extends string, T> extends MessageBase<P> {
  /** The payload of the request. */
  payload: T;
}

/** Type for an RPC successful response message. */
export interface OkResponseMessage<P extends string, T> extends MessageBase<P> {
  /** Determines whether this is a success or error response. */
  ok: true;
  /** The payload of the response. */
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
