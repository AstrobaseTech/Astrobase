/** @module S3 */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import type { Channel } from '../channels/channel.interface.js';

/**
 * Creates a channel for AWS S3 or S3 compatible API.
 *
 * To use this, install and use the
 * [`@aws-sdk/client-s3`](https://www.npmjs.com/package/@aws-sdk/client-s3) package to configure an
 * `S3Client` to pass to this function.
 *
 * @param client A configured `S3Client`.
 * @param Bucket The bucket to read and write data to.
 * @returns A {@linkcode Channel} for the S3 bucket.
 * @experimental
 */
export function S3Driver(client: S3Client, Bucket: string) {
  return {
    /** See {@linkcode Channel}. */
    async delete(id) {
      await client.send(new DeleteObjectCommand({ Bucket, Key: id.toBase58() }));
    },

    /** See {@linkcode Channel}. */
    async get(id) {
      try {
        const result = await client.send(new GetObjectCommand({ Bucket, Key: id.toBase58() }));
        return result.Body?.transformToByteArray();
      } catch (error) {
        return;
      }
    },

    /** See {@linkcode Channel}. */
    async put(id, Body) {
      await client.send(new PutObjectCommand({ Bucket, Key: id.toBase58(), Body }));
    },
  } satisfies Channel;
}
