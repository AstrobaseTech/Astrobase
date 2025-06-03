import { inMemory } from './in-memory-client.js';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';

testRPCStrategyForContent('In-memory client', inMemory());
