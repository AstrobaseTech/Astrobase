/** @module SQLite */

import SQLite from 'better-sqlite3';
import type { ContentProcedures } from '../content/procedures.js';
import type { ClientStrategy } from '../rpc/client/client-strategy.js';

/**
 * Configuration options for SQLite. Please refer to [`better-sqlite3` API
 * docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options).
 */
export interface SQLiteClientConfig extends SQLite.Options {
  /**
   * Database file name. You can create an in-memory database by passing ":memory:" as the first
   * argument. You can create a temporary database by passing an empty string (or by omitting all
   * arguments).
   */
  filename?: string | Buffer;
}

/**
 * Creates a {@link ClientStrategy} for SQLite3.
 *
 * This is implemented using [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) - a peer
 * dependency. You'll need to install it for your app:
 *
 *     npm i better-sqlite3
 */
export default function (config: SQLiteClientConfig = {}): ClientStrategy<ContentProcedures> {
  const { filename, ...options } = config;

  const sql = new SQLite(filename, options);

  sql.pragma('journal_mode = WAL');

  process.on('exit', () => sql.close());

  // Ensure table exists

  sql
    .prepare(
      `CREATE TABLE IF NOT EXISTS astrobase (
        cid TEXT PRIMARY KEY,
        content BLOB NOT NULL
      ) WITHOUT ROWID`,
    )
    .run();

  return {
    'content:delete'(cid) {
      sql.prepare<string>('DELETE FROM astrobase WHERE cid = ?').run(cid.toString());
    },

    'content:get'(cid) {
      const result = sql
        .prepare<string, { content: Buffer }>('SELECT content FROM astrobase WHERE cid = ?')
        .get(cid.toString())?.content;
      return result ? new Uint8Array(result) : undefined;
    },

    'content:put'({ cid, content }) {
      sql
        .prepare<
          [string, Uint8Array]
        >('INSERT OR REPLACE INTO astrobase (cid, content) VALUES (?, ?)')
        .run(cid.toString(), content);
    },
  };
}
