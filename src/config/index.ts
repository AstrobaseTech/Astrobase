/**
 * A module that allows user to configure instances via configuration object.
 *
 * The Astrobase command line executable uses this to call `loadConfig` to attempt to read a config
 * located at `astrobase.config.js` from the current working directory.
 *
 * This module may also be used as a convenient way to configure Astrobase programmatically in one
 * place, although note that this configuration solution is not the most tree-shake-friendly and
 * will bloat your app's bundle size.
 *
 * ## Configuration file
 *
 * Create the `astrobase.config.js` and export the config via the `default` export:
 *
 *     export default {
 *       http: true,
 *     };
 *
 * Add `@type {import('@astrobase/core/config').GlobalConfig}` to the JSDoc comment to get syntax
 * and type checking.
 *
 * @module Config
 */

export * from './apply.js';
export * from './load.js';
export * from './schema.js';
