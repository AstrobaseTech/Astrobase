/** @module S3 */

// prettier-ignore
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import type { ContentProcedures } from '../content/procedures.js';
import type { ClientStrategy } from '../rpc/client/client-strategy.js';

/** Configuration for {@link s3} {@link ClientStrategy}. */
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
 * Creates a {@link ClientStrategy} for AWS S3 (or other S3-compatible API).
 *
 * Requires `@aws-sdk/client-s3`:
 *
 *     npm i @aws-sdk/client-s3
 *
 * @param config The {@link S3StrategyConfig} configuration object containing the configured
 *   `S3Client` and target bucket.
 * @returns The {@link ClientStrategy}.
 */
export const s3 = (config: S3StrategyConfig): ClientStrategy<ContentProcedures> => ({
  async 'content:delete'(cid) {
    await config.Client.send(
      new DeleteObjectCommand({
        Bucket: config.Bucket,
        Key: cid.toString(),
      }),
    );
  },

  async 'content:get'(cid) {
    try {
      const result = await config.Client.send(
        new GetObjectCommand({
          Bucket: config.Bucket,
          Key: cid.toString(),
        }),
      );
      return await result.Body?.transformToByteArray();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return;
    }
  },

  async 'content:put'({ cid, content }) {
    await config.Client.send(
      new PutObjectCommand({
        Bucket: config.Bucket,
        Key: cid.toString(),
        Body: content,
      }),
    );
  },
});
