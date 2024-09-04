/**
 * Channels bridge the engine with the outside world. They are a way of getting data into and out of
 * external data stores, services and applications - such as a cache, a database, a peer, or an API.
 * They can also be used to receive updates from the Astrobase engine to create a reactive API for a
 * frontend application.
 *
 * ## Registering Channels
 *
 * You can get the {@linkcode Channels} for an instance using the {@linkcode getChannels} function.
 * This returns a JavaScript array which can be manipulated directly. For example, you can `.push` a
 * channel or group of channels to it directly.
 *
 * ```js
 * import { getChannels } from '@astrobase/core/channels';
 *
 * getChannels().push(\/* myChannel *\/);
 * ```
 *
 * Multiple channels can be registered for an instance. They are registered as single entries or
 * groups of multiple in an array. The significance of this is important for `get` operations, where
 * each entry of the channels array is queried synchronously, and groups are queried asynchronously
 * when encountered.
 *
 * ## Implementing a Channel
 *
 * A Channel implements the {@linkcode Channel} interface to effectively register hooks for `get`,
 * `put`, and `delete` operations.
 *
 * @module Channels
 */

export * from './channel.interface.js';
export * from './channels.js';
