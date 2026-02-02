import Database from 'better-sqlite3';
import { randomBytes } from 'node:crypto';
import { expect, it, test } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import sqlite from './sqlite.js';

testRPCStrategyForContent('SQLite', sqlite());

it('Uses given Database instance', () => {
  expect(() => {
    sqlite(new Database('').close());
  }).toThrow('The database connection is not open');
});
