import 'fake-indexeddb/auto';
import { test } from 'vitest';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import { indexeddb } from './indexeddb.js';

testRPCStrategyForContent('IndexedDB', await indexeddb());

test.todo('Multiple instances with different database or table names');
