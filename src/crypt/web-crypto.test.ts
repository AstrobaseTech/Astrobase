import { testCryptSupport } from './test/test-support.js';
import { WebCrypto, WebCryptoSupportedCryptAlgs } from './web-crypto.js';

testCryptSupport('WebCrypto', WebCrypto, WebCryptoSupportedCryptAlgs);
