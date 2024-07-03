import { Buffer } from 'buffer';
import { getChannels } from '../../channels/channels.js';
import { createDispatch } from '../../rpc/client/dispatch.js';
import { KEYRINGS_INSTANCE_ID } from '../shared/index.js';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

const dispatch = createDispatch(self);

getChannels(KEYRINGS_INSTANCE_ID).push({
  delete: (id) => dispatch('delete', id.bytes, KEYRINGS_INSTANCE_ID),
  get: (id) => dispatch('get', id.bytes, KEYRINGS_INSTANCE_ID),
  put: (id, content) => dispatch('put', { id: id.bytes, content }, KEYRINGS_INSTANCE_ID),
});

self.postMessage('ready');
