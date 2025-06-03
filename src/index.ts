/** Support for package.json `main` entrypoint for backwards compatibility. */

export * from './ascii/ascii.js';
export * from './bip39/bip39.js';

import BIP39_WORDLIST_ENGLISH from './bip39/wordlist/en.json' with { type: 'json' };
export { BIP39_WORDLIST_ENGLISH };

export * from './cid/cid.js';
export * from './codecs/codecs.js';
export * from './codecs/binary/binary.js';
export * from './codecs/json/json.js';
export * from './common/common.js';
export * from './content/index.js';
export * from './ecdsa/index.js';
export * from './encrypt/index.js';
export * from './events/events.js';
export * from './file/index.js';
export * from './fs/fs.client.js';
export * from './hashing/index.js';
export * from './http/http.client.js';
export * from './http/http.server.js';
export * from './identity/identity.js';
export * from './immutable/index.js';
export * from './in-memory/in-memory-client.js';
export * from './indexeddb/indexeddb.js';
export * from './instance/instance.js';
export * from './internal/index.js';
export * from './keyrings/keyrings.js';
export * from './media-types/media-types.js';
export * from './middleware/index.js';
export * from './mutable/mutable.js';
export * from './rpc/client/index.js';
export * from './rpc/server/server.js';
export * from './rpc/shared/index.js';
export * from './s3/s3.js';
export * from './sqlite/sqlite.js';
export * from './varint/varint.js';
export * from './wraps/index.js';
