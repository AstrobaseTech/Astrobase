import { randomBytes } from 'crypto';
import { describe, expect, test } from 'vitest';
import { ContentIdentifier } from '../cid/cid.js';
import { Common } from '../common/common.js';
import { createInstance } from '../instance/instance.js';
import { FileBuilder } from './file-builder.js';
import { parseAsFile } from './parse.js';

describe('parseAsFile', () => {
  const instance = createInstance(Common);
  const cid = new ContentIdentifier('test', randomBytes(32));

  test('Parses valid file content', async () => {
    const file = await new FileBuilder()
      .setMediaType('application/json')
      .setValue({ hello: 'world!' }, instance);

    await expect(parseAsFile(cid, file.buffer, instance)).resolves.toEqual(file);
  });

  test('Throws for invalid file', () =>
    expect(parseAsFile(cid, randomBytes(64), instance)).rejects.toThrow());
});
