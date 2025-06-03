/**
 * @module HTTP/Server
 * @category API Reference
 * @experimental
 */

import { createServer, ServerResponse } from 'http';
import { decodeWithCodec, encodeWithCodec } from '../codecs/codecs.js';
import type { Instance } from '../instance/instance.js';
import { processRequest } from '../rpc/server/server.js';

/** A HTTP server configuration. */
export interface HttpServerConfig {
  /** Instance to use for codec & procedure handler resolution. */
  instance: Instance;

  /**
   * API path prefix for requests.
   *
   * @default '/astrobase/'
   */
  prefix?: string;

  /**
   * Port number to use.
   *
   * @default 3000
   */
  port?: number;
}

/**
 * Spins up a HTTP server.
 *
 * @param config {@link HttpServerConfig}
 */
export function serve(config: HttpServerConfig) {
  const prefix = config.prefix ?? '/astrobase/';
  const port = config.port ?? 3000;

  return createServer((req, res) => {
    const procedure = req.url!.split(prefix)[1];
    if (
      validate(res, !!req.url?.startsWith(prefix), 404) &&
      validate(res, !!procedure, 404) &&
      validate(res, req.method === 'POST', 405) &&
      validate(res, !!req.headers['content-type'], 415)
    ) {
      let data = '';
      req.on('data', (chunk: string) => (data += chunk));
      req.on('end', async () => {
        try {
          const payload = await decodeWithCodec(
            config.instance,
            new TextEncoder().encode(data),
            req.headers['content-type']!,
          );

          try {
            const result = await processRequest(config.instance, {
              jobID: 0,
              payload,
              procedure,
            });
            const resMsg = await encodeWithCodec(config.instance, result, 'application/json');
            res.writeHead(200, { 'content-type': 'application/json' }).end(resMsg);
          } catch (e) {
            res.writeHead(500, { 'content-type': 'text/plain' }).end('Unable to process request');
            // eslint-disable-next-line no-console
            console.error(e);
          }
        } catch {
          res.writeHead(400, { 'content-type': 'text/plain' }).end('Invalid request body');
        }
      });
    }
    // eslint-disable-next-line no-console
  }).listen(port, () => console.log(`HTTP: listening at http://localhost:${port}`));
}

function validate(res: ServerResponse, condition: boolean, errCode: number) {
  if (!condition) {
    res.writeHead(errCode).end();
  }
  return condition;
}
