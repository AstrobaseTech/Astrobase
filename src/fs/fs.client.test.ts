import { mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import { afterAll, describe } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import { filesystem } from './fs.client.js';

describe('Filesystem client', async () => {
  const dir = resolve('.', 'tmp');

  mkdirSync(dir, { recursive: true });

  testRPCStrategyForContent('Filesystem', await filesystem({ dir }));

  afterAll(() => {
    rmSync(dir, { force: true, recursive: true });
  });
});
