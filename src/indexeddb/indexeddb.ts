/** @module IndexedDB */

import type { RPCClientStrategy } from '../rpc/client/types.js';
import type { PutRequestPayload } from '../rpc/shared/index.js';

/** Configuration object for the IndexedDB channel driver. */
export interface IndexedDBConfig {
  /**
   * The IndexedDB database name.
   *
   * @default 'astrobase'
   */
  database?: string;
  /**
   * The IndexedDB table name.
   *
   * @default 'astrobase'
   */
  table?: string;
}

/**
 * Creates an RPC client strategy for IndexedDB to handle content procedures.
 *
 * @param config An optional {@linkcode IndexedDBConfig} object to configure aspects of the strategy.
 * @returns An RPC client strategy for IndexedDB.
 */
export async function indexeddb(config?: IndexedDBConfig): Promise<RPCClientStrategy> {
  const database = config?.database ?? 'astrobase';
  const table = config?.table ?? 'astrobase';
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(database);
    request.onerror = () => reject(request.error!);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(table, { keyPath: 'cid' });
    };
  });
  return {
    procedures: {
      'content:delete': (cid) =>
        new Promise((resolve, reject) => {
          const request = db.transaction(table, 'readwrite').objectStore(table).delete(cid.bytes);
          request.onerror = () => reject(request.error!);
          request.onsuccess = () => resolve();
        }),

      'content:get': (cid) =>
        new Promise((resolve, reject) => {
          const request = db.transaction(table, 'readonly').objectStore(table).get(cid.bytes);
          request.onerror = () => reject(request.error!);
          request.onsuccess = () =>
            resolve((request.result as { content: ArrayBuffer } | undefined)?.content);
        }),

      'content:put': ({ cid, content }: PutRequestPayload) =>
        new Promise((resolve, reject) => {
          const request = db
            .transaction(table, 'readwrite')
            .objectStore(table)
            .put({ cid: cid.bytes, content });
          request.onerror = () => reject(request.error!);
          request.onsuccess = () => resolve();
        }),
    },
  };
}
