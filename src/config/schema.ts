import type { Codec } from '../codec/codecs.js';
import type { HashFn } from '../hashes/index.js';
import type { HttpServerConfig } from '../http/http.server.js';
import type { ContentIdentifierSchemeParser } from '../identifiers/identifiers.js';
import type { MaybePromise } from '../internal/index.js';
import type { Middleware } from '../middleware/index.js';
import type { RPCClientConfig } from '../rpc/client/index.js';

export interface InstanceConfig {
  codecs?: Record<`${string}/${string}`, MaybePromise<Codec>>;
  hashes?: Record<number, MaybePromise<HashFn>>;
  middlewares?: Array<MaybePromise<Middleware>>;
  schemes?: Record<number, MaybePromise<ContentIdentifierSchemeParser<unknown>>>;
}

export interface GlobalConfig extends Omit<InstanceConfig, 'middlewares'> {
  clients?: Array<MaybePromise<RPCClientConfig>>;
  http?: boolean | HttpServerConfig | HttpServerConfig[];
  instances?: Record<string, InstanceConfig>;
}
