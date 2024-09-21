import { S3Client } from '@aws-sdk/client-s3';
import { test } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import { s3 } from './s3.js';

const Bucket = process.env.TEST_S3_BUCKET;
const ENDPOINT = process.env.TEST_S3_ENDPOINT;
const KEY = process.env.TEST_S3_KEY;
const KEY_ID = process.env.TEST_S3_KEY_ID;
const REGION = process.env.TEST_S3_REGION;

if (!Bucket || !ENDPOINT || !KEY || !KEY_ID || !REGION) {
  // eslint-disable-next-line no-console
  console.warn('Missing TEST_S3_* from environment. Skipping S3Driver tests.');
  test.todo('S3 [skipped]');
} else {
  const Client = new S3Client({
    credentials: {
      accessKeyId: KEY_ID,
      secretAccessKey: KEY,
    },
    region: REGION,
    endpoint: ENDPOINT,
  });

  testRPCStrategyForContent('S3', s3({ Bucket, Client }));
}
