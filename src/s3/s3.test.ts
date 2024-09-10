import { S3Client } from '@aws-sdk/client-s3';
import { expect, test } from 'vitest';
import { ContentIdentifier } from '../identifiers/identifiers.js';
import { S3Driver } from './s3.js';

test('S3 Driver', async () => {
  const BUCKET = process.env.TEST_S3_BUCKET;
  const ENDPOINT = process.env.TEST_S3_ENDPOINT;
  const KEY = process.env.TEST_S3_KEY;
  const KEY_ID = process.env.TEST_S3_KEY_ID;
  const REGION = process.env.TEST_S3_REGION;

  if (!BUCKET || !ENDPOINT || !KEY || !KEY_ID || !REGION) {
    // eslint-disable-next-line no-console
    console.warn('Missing TEST_S3_* from environment. Skipping S3Driver tests.');
  } else {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: KEY_ID,
        secretAccessKey: KEY,
      },
      region: REGION,
      endpoint: ENDPOINT,
    });

    const driver = S3Driver(s3, BUCKET);

    const body = new TextEncoder().encode('test');
    const id = new ContentIdentifier([0, ...body]);
    await expect(driver.put(id, body)).resolves.toBeUndefined();
    await expect(driver.get(id)).resolves.toEqual(body);
    await expect(driver.delete(id)).resolves.toBeUndefined();
    await expect(driver.get(id)).resolves.toBeUndefined();
  }
});
