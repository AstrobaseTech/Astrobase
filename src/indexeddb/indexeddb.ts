/**
 * This module implements a driver for IndexedDB in Astrobase. To get started, use
 * {@linkcode indexeddb} to create a driver, then register it.
 *
 * ```js
 * import { getChannels } from '@astrobase/core';
 * import { indexeddb } from '@astrobase/core/indexeddb';
 *
 * indexeddb().then((driver) => {
 *   getChannels().push(driver);
 * });
 * ```
 *
 * @module IndexedDB
 */

import type { Channel } from '../channels/channel.interface.js';
import type { ContentIdentifier } from '../identifiers/identifiers.js';

/**
 * Configuration object for the IndexedDB channel driver.
 *
 * @category Channel
 */
export interface IndexedDbChannelOptions {
  /**
   * The IndexedDB database name.
   *
   * @default 'astrobase'
   */
  databaseName?: string;
  /**
   * The IndexedDB table name.
   *
   * @default 'astrobase'
   */
  tableName?: string;
}

/**
 * Creates an IndexedDB {@linkcode Channel}.
 *
 * ## Usage
 *
 * ```js
 * import { getChannels } from '@astrobase/core';
 * import { indexeddb } from '@astrobase/core/indexeddb';
 *
 * indexeddb().then((driver) => {
 *   getChannels().push(driver);
 * });
 * ```
 *
 * Note that this function returns a promise. Once awaited, the database connection is initiated and
 * a {@linkcode Channel} is resolved, which can be registered.
 *
 * @category Channel
 * @param config An optional configuration object.
 * @returns A promise that resolves with the `Channel` interface once the indexedDB connection has
 *   been established.
 */
export async function indexeddb(config?: IndexedDbChannelOptions) {
  const databaseName = config?.databaseName ?? 'astrobase';
  const tableName = config?.tableName ?? 'astrobase';
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(tableName, { keyPath: 'id' });
    };
  });
  return new IndexeddbDriver(db, databaseName, tableName);
}

/**
 * An IndexedDB {@linkcode Channel}.
 *
 * @category Channel
 */
export class IndexeddbDriver implements Channel {
  constructor(
    /** @ignore */
    private readonly db: IDBDatabase,
    /** The IndexedDB database name. */
    readonly databaseName: string,
    /** The IndexedDB table name. */
    readonly tableName: string,
  ) {}

  delete(id: ContentIdentifier): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName)
        .delete(id.bytes);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  get<T>(id: ContentIdentifier): Promise<T | void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readonly')
        .objectStore(this.tableName)
        .get(id.bytes);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as { value: T })?.value);
    });
  }

  put(id: ContentIdentifier, value: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName)
        .put({ id: id.bytes, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
