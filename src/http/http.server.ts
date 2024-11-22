import { createServer, ServerResponse } from 'http';
import { processRequest } from '../rpc/server.js';
import { validateRequest } from '../rpc/shared/request.js';

export interface HttpOptions {
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

export function serve(options?: HttpOptions) {
  const apiPath = options?.apiPath ?? '/astrobase';
  const port = options?.port ?? 3000;

  return createServer((req, res) => {
    if (
      validate(res, req.url === apiPath, 404) &&
      validate(res, req.method === 'POST', 405) &&
      validate(res, req.headers['content-type'] === 'application/json', 415)
    ) {
      let data = '';
      req.on('data', (chunk) => (data += chunk as string));
      req.on('end', async () => {
        try {
          const reqMsg = validateRequest(JSON.parse(data));

          try {
            const resMsg = JSON.stringify(await processRequest(reqMsg));
            res.writeHead(200, { 'content-type': 'application/json' }).end(resMsg);
          } catch (e) {
            // TODO: appropriate response for unsupported procedures, or procedure threw an error
            res.writeHead(500).end();
            // eslint-disable-next-line no-console
            console.error(e);
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          res
            .writeHead(400, { 'content-type': 'text/plain' })
            .end('Request body is not a valid JSON request message');
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
