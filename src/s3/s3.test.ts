/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { S3Client } from '@aws-sdk/client-s3';
import { describe } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import { s3 } from './s3.js';

const {
  TEST_S3_BUCKET: BUCKET,
  TEST_S3_ENDPOINT: ENDPOINT,
  TEST_S3_KEY: KEY,
  TEST_S3_KEY_ID: KEY_ID,
  TEST_S3_REGION: REGION,
} = process.env;

describe.runIf(BUCKET && ENDPOINT && KEY && KEY_ID && REGION)('S3 client', () => {
  const Client = new S3Client({
    credentials: {
      accessKeyId: KEY_ID!,
      secretAccessKey: KEY!,
    },
    region: REGION,
    endpoint: ENDPOINT,
  });

  testRPCStrategyForContent('S3', s3({ Bucket: BUCKET!, Client }));
});
