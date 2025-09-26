import type { FileBuilder } from '../file/file-builder.js';
import type { Instance } from '../instance/instance.js';
import type { MaybePromise } from '../internal/index.js';

/** A Wrap function that either wraps or unwraps the input. */
export type WrapFn<TInputMetadata, TOutputMetadata> = (config: {
  /** The instance config. */
  instance: Instance;
  /** The metadata. */
  metadata: TInputMetadata;
  /** The input value. */
  payload: Uint8Array<ArrayBuffer>;
}) => MaybePromise<{
  /** Metadata for the processed value. */
  metadata: TOutputMetadata;
  /** The processed value. */
  payload: Uint8Array<ArrayBuffer>;
}>;

/** A module provided to the Instance config that implements a strategy for a Wrap type. */
export interface WrapModule<TWrappedMetadata, TUnwrappedMetadata> {
  /** The strategy function for unwrapping the value. */
  unwrap: WrapFn<TWrappedMetadata, TUnwrappedMetadata>;
  /** The strategy function for wrapping the value. */
  wrap: WrapFn<TUnwrappedMetadata, TWrappedMetadata>;
}

interface WrapBase<T> {
  /** The Wrap type. */
  type: string;

  /**
   * The metadata for the Wrap implementation. A File is used here for control over the media type
   * used at serialization.
   */
  metadata: FileBuilder<T>;
}

/** An unwrapped value. */
export interface Unwrapped<TValue = unknown, TMetadata = unknown> extends WrapBase<TMetadata> {
  /** The unwrapped value. */
  value: FileBuilder<TValue>;
}

/** A deserialized wrapped value. */
export interface Wrapped<T = unknown> extends WrapBase<T> {
  /** The Wrap buffer. */
  payload: Uint8Array<ArrayBuffer>;
}
