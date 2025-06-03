/**
 * Includes utilities for building and parsing Files.
 *
 * A File, in Astrobase, is a binary encoding for a container that includes a binary payload and its
 * media type. It is used in all default content identifier schemes: immutable, mutable, and
 * identity.
 *
 * ## Format
 *
 *     +--------------+----------+---------+
 *     |  Media Type  | NUL Byte | payload |
 *     |     ASCII    |          |         |
 *     | <= 127 bytes |  1 byte  |   ...   |
 *     +--------------+----------+---------+
 *
 * It consists of:
 *
 * - ASCII media type. This is optional. If provided, it must be no more than 127 bytes. When omitted,
 *   the media type is assumed to be `application/octet-stream` (raw binary).
 * - NUL byte separator (0x00).
 * - The binary content payload. This may be of any length.
 *
 * @module Files
 * @category API Reference
 * @experimental
 */

export * from './file-builder.js';
export * from './parse.js';
