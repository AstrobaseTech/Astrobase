import { testCryptSupport } from './testing/test-support.js';
import { WebCryptoCrypt, WebCryptoCryptAlgs } from './web-crypto.js';

testCryptSupport(
  'WebCrypto',
  WebCryptoCrypt,
  WebCryptoCryptAlgs.map((encAlg) => ({ encAlg, nonceLength: encAlg === 'AES-CBC' ? 16 : 12 })),
);
