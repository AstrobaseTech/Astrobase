import type { ContentIdentifier } from '../cid/cid.js';

/** The `ProcedureConfig` for `content:*` procedures. */
export type ContentProcedures = {
  /** The request and response types of the `content:delete` procedure. */
  'content:delete': [ContentIdentifier, void];
  /** The request and response types of the `content:get` procedure. */
  'content:get': [ContentIdentifier, ArrayLike<number> | ArrayBuffer | void];
  /** The request and response types of the `content:put` procedure. */
  'content:put': [PutRequestPayload, void];
};

/** `content:put` request data. */
export interface PutRequestPayload {
  /** The {@link ContentIdentifier}. */
  cid: ContentIdentifier;
  /** The content buffer payload. */
  content: Uint8Array;
}
