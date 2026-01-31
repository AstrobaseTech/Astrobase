import { NodeCryptModule, NodeCryptAlgs } from './node.js';
import { testCryptSupport } from './testing/test-support.js';

testCryptSupport(
  'Node',
  NodeCryptModule,
  NodeCryptAlgs.map((encAlg) => ({ encAlg, nonceLength: 12 })),
);
