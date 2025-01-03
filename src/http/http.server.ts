/** @module HTTP/Server */

import { createServer, ServerResponse } from 'http';
import { decodeWithCodec, encodeWithCodec } from '../codec/codecs.js';
import { processRequest } from '../rpc/server.js';

/** A HTTP server configuration. */
export interface HttpServerConfig {
  /**
   * Instance to use for codec & procedure handler resolution.
   *
   * @default undefined
   */
  instanceID?: string;

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
 * @param config {@linkcode HttpServerConfig}
 */
export function serve(config?: HttpServerConfig) {
  const prefix = config?.prefix ?? '/astrobase/';
  const port = config?.port ?? 3000;

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
            new TextEncoder().encode(data),
            req.headers['content-type']!,
            config?.instanceID,
          );

          try {
            const result = await processRequest({
              instanceID: config?.instanceID,
              jobID: 0,
              payload,
              procedure,
            });
            const resMsg = await encodeWithCodec(result, 'application/json', config?.instanceID);
            res.writeHead(200, { 'content-type': 'application/json' }).end(resMsg);
          } catch (e) {
            // TODO: appropriate response for unsupported procedures, or procedure threw an error
            res.writeHead(500, { 'content-type': 'text/plain' }).end('Unable to process request');
            // eslint-disable-next-line no-console
            console.error(e);
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // TODO: appropriate response for unsupported content type
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
