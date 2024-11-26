import { createServer, ServerResponse } from 'http';
import { decodeWithCodec, encodeWithCodec } from '../codec/codecs.js';
import { processRequest } from '../rpc/server.js';
import { validateRequest } from '../rpc/shared/request.js';

/** A HTTP server configuration. */
export interface HttpServerConfig {
  /**
   * Port number to use.
   *
   * @default 3000
   */
  port?: number;

  /**
   * API path for requests.
   *
   * @default '/astrobase'
   */
  apiPath?: string;
}

/**
 * Spins up a HTTP server.
 *
 * @param config {@linkcode HttpServerConfig}
 */
export function serve(config?: HttpServerConfig) {
  const apiPath = config?.apiPath ?? '/astrobase';
  const port = config?.port ?? 3000;

  return createServer((req, res) => {
    if (
      validate(res, req.url === apiPath, 404) &&
      validate(res, req.method === 'POST', 405) &&
      validate(res, !!req.headers['content-type'], 415)
    ) {
      let data = '';
      req.on('data', (chunk: string) => (data += chunk));
      req.on('end', async () => {
        try {
          const reqMsg = validateRequest(
            await decodeWithCodec(new TextEncoder().encode(data), req.headers['content-type']!),
          );

          try {
            const resMsg = await encodeWithCodec(await processRequest(reqMsg), 'application/json');
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
