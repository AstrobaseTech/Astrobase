import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import sqlite from './sqlite.js';

testRPCStrategyForContent('SQLite', sqlite());
