import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { afterAll, describe, expect, test } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import fs from './fs.client.js';

describe('Filesystem client', async () => {
  const dir = mkdtempSync('astrobase-test-');
  const eaccesTestDir = join(dir, 'EACCES_TEST_DIR');
  const enotdirTestFile = join(dir, 'ENOTDIR_TEST_FILE');

  mkdirSync(eaccesTestDir, { mode: 0o555 });
  writeFileSync(enotdirTestFile, '');

  testRPCStrategyForContent('Filesystem', await fs({ dir }));

  test('Correctly throws ENOTDIR', () =>
    expect(fs({ dir: enotdirTestFile })).rejects.toThrow('ENOTDIR'));

  test('Correctly throws EACCES', () =>
    expect(fs({ dir: eaccesTestDir })).rejects.toThrow('EACCES'));

  afterAll(() => rmSync(dir, { force: true, recursive: true }));
});
