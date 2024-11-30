/**
 * Adds support for using the native filesystem for content storage and retrieval.
 *
 * @module FS
 */

import { access, constants, readFile, rm, stat, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

import type { ContentIdentifier } from '../identifiers/identifiers.js';
import type { RPCClientStrategy } from '../rpc/client/types.js';

/** A filesystem client configuration object. */
export interface FilesystemClientConfig {
  /**
   * The target directory for content storage. Note that the directory must exist - it will not be
   * automatically created.
   */
  dir: string;
}

/**
 * Creates an {@linkcode RPCClientStrategy} for the native filesystem.
 *
 * @param options The {@linkcode FilesystemClientConfig} object containing the target directory path.
 * @returns A promise that resolves with the the {@linkcode RPCClientStrategy}.
 */
export default async function (options: FilesystemClientConfig): Promise<RPCClientStrategy> {
  const dir = resolve(options.dir);

  const [isDir] = await Promise.all([
    stat(dir).then((s) => s.isDirectory()),
    access(dir, constants.R_OK | constants.W_OK),
  ]);

  if (!isDir) {
    throw new Error('ENOTDIR: ' + dir);
  }

  /** Joins `dir` with `cid` to get path. */
  const j = (cid: ContentIdentifier) => join(dir, cid.toString());

  return {
    procedures: {
      'content:delete': (cid) => rm(j(cid)),
      'content:get': async (cid) => {
        try {
          const buf = await readFile(j(cid));
          return new Uint8Array(buf);
        } catch (e) {
          if ((e as { code: string } | undefined)?.code === 'ENOENT') {
            return;
          }
          throw e;
        }
      },
      'content:put': ({ cid, content }) => writeFile(j(cid), content),
    },
  };
}
