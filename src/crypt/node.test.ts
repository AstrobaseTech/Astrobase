import { NodeCrypto, NodeSupportedCryptAlgs } from './node.js';
import { testCryptSupport } from './test/test-support.js';

testCryptSupport('Node', NodeCrypto, NodeSupportedCryptAlgs);
