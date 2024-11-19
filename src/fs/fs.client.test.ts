import { resolve } from 'path';
import { testRPCStrategyForContent } from '../../testing/rpc-strategy.js';
import { filesystem } from './fs.client.js';

const dir = resolve('.', 'tmp');
testRPCStrategyForContent('Filesystem', await filesystem({ dir }));
