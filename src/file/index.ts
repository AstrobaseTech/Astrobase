/**
 * A file, in Astrobase, is a special encoding format that is used in the Astrobase protocol as a
 * container for binary payloads. It can include certain metadata, like a timestamp and a media
 * type, that can be used by various parts of the system.
 *
 * ## Format
 *
 *     +-----------+--------+------------+--------------+---------+
 *     |  version  |  flags | timestamp? |  mediatype?  | payload |
 *     |  varint   | bitset |   uint32   |     ASCII    |         |
 *     |           | 1 byte |            | <= 128 bytes |   ...   |
 *     +-----------+--------+------------+--------------+---------+
 *
 * ### Version
 *
 * The version is an integer indicating which version of the encoding the file uses. At present,
 * there is only version 1. Future versions may change the format, by adding or removing features,
 * or upgrading existing ones.
 *
 * It is worth noting that this is encoded as a [Protobuf style
 * varint](https://protobuf.dev/programming-guides/encoding/#varints), although this does not
 * actually make a difference unless or until the format reaches a 128th version.
 *
 * ### Flags
 *
 * A reserved byte containing a bitset. Each bit within indicates the presence of an item of
 * metadata. Only two of the eight bits are used, and the unused bits are simply ignored.
 *
 *     +--------------+--------------+---+---+---+---+---+---+
 *     |       1      |       2      | 3 | 4 | 5 | 6 | 7 | 8 |
 *     +--------------+--------------+---+---+---+---+---+---+
 *     | hasTimestamp | hasMediaType |        (unused)       |
 *     +--------------+--------------+-----------------------+
 *
 * ### Timestamp
 *
 * If the `hasTimestamp` flag is set, the file includes a timestamp - the number of seconds since
 * Unix Epoch (UTC) encoded as a 32 bit unsigned integer, little-endian.
 *
 * #### Limitations
 *
 * - The minimum timestamp is `1970-01-01 00:00:00`. A timestamp should reflect when the data existed
 *   on Astrobase which couldn't have been before 2024 anyway, so arguably this minimum could be
 *   raised to `2024-XX-XX XX:XX:XX`. We use the Unix epoch mainly for familiarity and compatibility
 *   sake.
 * - The maximum timestamp is `2106-02-07 06:28:15`. This presents the same "2106 problem" that
 *   Bitcoin faces, but it will be trivial to upgrade the protocol by then.
 * - The timestamp's precision is down to seconds. A future version could add an optional millisecond
 *   or microseconds field if there is a need for more precise timing.
 *
 * ### Media Type
 *
 * If the `hasMediaType` flag is set, the file includes a media type, also commonly known as a MIME
 * type. This is encoded as variable length ASCII text terminated by a NUL char (`0x00`), up to a
 * maximum of 128 chars/bytes.
 *
 * The media type is intended to work with the codec system, and by extension the middleware system,
 * to enable the engine to perform automatic parsing, validation and transformation of the payload.
 * For instance, if the media type of a file is `application/json`, the engine can use the JSON
 * codec registered for the `application/json` media type.
 *
 * If the file's media type is omitted, it is treated as raw binary (`application/octet-stream`).
 *
 * ### Payload
 *
 * The rest of the file includes the binary payload, which can be of any length.
 *
 * @module Files
 */

export * from './file.js';
export * from './media-types.js';
