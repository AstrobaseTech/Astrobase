import { mkdir, rm, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { afterAll, describe, expect, test } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import fs from './fs.client.js';

describe('Filesystem client', async () => {
  const dir = resolve('.', 'tmp');
  const enotdirTestFile = join(dir, 'ENOTDIR_TEST_FILE');
  const eaccesTestDir = join(dir, 'EACCES_TEST_DIR');

  await Promise.all([
    mkdir(dir, { recursive: true }),
    writeFile(enotdirTestFile, ''),
    mkdir(eaccesTestDir, { mode: 0o555 }),
  ]);

  testRPCStrategyForContent('Filesystem', await fs({ dir }));

  test('Correctly throws ENOTDIR', () =>
    expect(fs({ dir: enotdirTestFile })).rejects.toThrow('ENOTDIR'));

  test('Correctly throws EACCES', () =>
    expect(fs({ dir: eaccesTestDir })).rejects.toThrow('EACCES'));

  afterAll(() => rm(dir, { force: true, recursive: true }));
});
