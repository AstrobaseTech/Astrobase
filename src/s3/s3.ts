/** @module S3 */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import type { RPCClientStrategy } from '../rpc/client/types.js';
import type { ContentProcedures } from '../rpc/shared/index.js';

/** The configuration interface for the S3 {@linkcode RPCClientStrategy}. */
export interface S3StrategyConfig {
  /**
   * A configured `S3Client` from the
   * [`@aws-sdk/client-s3`](https://www.npmjs.com/package/@aws-sdk/client-s3) package.
   */
  Client: S3Client;
  /** The bucket to read and write data to. */
  Bucket: string;
}

/**
 * Creates an {@linkcode RPCClientStrategy} for AWS S3 (or other S3-compatible API).
 *
 * @param config The {@linkcode S3StrategyConfig} configuration object containing the configured
 *   `S3Client` and target bucket.
 * @returns The {@linkcode RPCClientStrategy}.
 */
export const s3 = (config: S3StrategyConfig): RPCClientStrategy<ContentProcedures> => ({
  procedures: {
    async 'content:delete'(payload) {
      await config.Client.send(
        new DeleteObjectCommand({
          Bucket: config.Bucket,
          Key: payload.toBase58(),
        }),
      );
    },

    async 'content:get'(payload) {
      try {
        const result = await config.Client.send(
          new GetObjectCommand({
            Bucket: config.Bucket,
            Key: payload.toBase58(),
          }),
        );
        return result.Body?.transformToByteArray();
      } catch (error) {
        return;
      }
    },

    async 'content:put'(payload) {
      await config.Client.send(
        new PutObjectCommand({
          Bucket: config.Bucket,
          Key: payload.cid.toBase58(),
          Body: payload.content,
        }),
      );
    },
  },
});
