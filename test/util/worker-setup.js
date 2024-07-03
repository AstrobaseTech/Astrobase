// @ts-nocheck

import { HandlerRegistry, listen } from '../../src/rpc/server/index.js';

export function setupTestWorkerScript(target) {
  HandlerRegistry.register({
    key: 'testsuccess',
    handler: (request, instanceID) => {
      if (request !== '12' || instanceID !== '34') {
        throw new Error('Unexpected request or instanceID value');
      }
      return 'success';
    },
  });

  HandlerRegistry.register({
    key: 'testerror',
    handler: (request, instanceID) => {
      if (request !== '12' || instanceID !== '34') {
        throw new Error('Unexpected request or instanceID value');
      }
      throw new Error('Expected error');
    },
  });

  listen(target);

  // eslint-disable-next-line
  target.postMessage('ready');
}
