import { CodecRegistry } from '../codec/codecs.js';
import { HashFnRegistry } from '../hashes/registry.js';
import { serve } from '../http/http.server.js';
import { SchemeRegistry } from '../identifiers/identifiers.js';
import { registerMiddleware } from '../middleware/registry.js';
import { clients } from '../rpc/client/client-management.js';
import type { GlobalConfig, InstanceConfig } from './schema.js';

export async function applyConfig(config: GlobalConfig) {
  const promises: Promise<unknown>[] = [];

  if (config.clients) {
    promises.push(Promise.all(config.clients.map(async (config) => clients.add(await config))));
  }

  if (config.codecs) {
    promises.push(
      Promise.all(
        Object.entries(config.codecs).map(async ([key, strategy]) => {
          strategy = await strategy;
          CodecRegistry.register({ strategy }, { global: true, key });
        }),
      ),
    );
  }

  if (config.hashes) {
    promises.push(
      Promise.all(
        Object.entries(config.hashes).map(async ([key, strategy]) => {
          strategy = await strategy;
          HashFnRegistry.register({ strategy }, { global: true, key: key as unknown as number });
        }),
      ),
    );
  }

  if (config.http) {
    if (config.http instanceof Array) {
      config.http.forEach(serve);
    } else {
      serve(config.http !== true ? config.http : undefined);
    }
  }

  if (config.schemes) {
    promises.push(
      Promise.all(
        Object.entries(config.schemes).map(async ([key, strategy]) => {
          strategy = await strategy;
          SchemeRegistry.register({ strategy }, { global: true, key: key as unknown as number });
        }),
      ),
    );
  }

  if (config.instances) {
    promises.push(
      Promise.all(Object.entries(config.instances).map(([k, v]) => applyInstanceConfig(k, v))),
    );
  }

  await Promise.all(promises);
}

export async function applyInstanceConfig(instanceID: string, config: InstanceConfig) {
  const promises: Promise<unknown>[] = [];

  if (config.codecs) {
    promises.push(
      Promise.all(
        Object.entries(config.codecs).map(async ([key, strategy]) => {
          strategy = await strategy;
          CodecRegistry.register({ strategy }, { instanceID, key });
        }),
      ),
    );
  }

  if (config.hashes) {
    promises.push(
      Promise.all(
        Object.entries(config.hashes).map(async ([key, strategy]) => {
          strategy = await strategy;
          HashFnRegistry.register({ strategy }, { instanceID, key: key as unknown as number });
        }),
      ),
    );
  }

  promises.push(
    (async () => {
      if (config.middlewares) {
        for (const middleware of config.middlewares) {
          registerMiddleware(await middleware);
        }
      }
    })(),
  );

  if (config.schemes) {
    promises.push(
      Promise.all(
        Object.entries(config.schemes).map(async ([key, strategy]) => {
          strategy = await strategy;
          SchemeRegistry.register({ strategy }, { instanceID, key: key as unknown as number });
        }),
      ),
    );
  }

  await Promise.all(promises);
}
