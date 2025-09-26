# Changelog

## Unreleased

### Breaking

- Upgraded to TypeScript 5.9 and resolved type definition changes.
- **BIP39:** Changed `@astrobase/sdk/bip39/wordlist/english` to be JavaScript rather than JSON.

## [0.5.0-beta.2](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.5.0-beta.2) - 2025-06-22

### Added

- **Identity:** Added `getNextIdentity` function.

### Breaking

- **Identity:** Changed the error thrown by `getIdentity` to `RangeError`.
- **Identity:** Changed `bip32` peer dependency version.

### Fixed

- **Identity:** Fixed `putIdentity` not using first available new identity.

## [0.5.0-beta.1](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.5.0-beta.1) - 2025-06-03

> Big update, added a lot of new functionality and redesigned much of the project. As a result, this changelog is probably not exhaustive.

### Breaking

- Changed middleware processing to recurse on arrays and simple objects only.
- Changed middleware processing to skip number and boolean primitive types.
- Removed type parameter from `decodeWithCodec`.
- Removed `LocalFallbackClient`.
- Comments (including JSDoc) are stripped from transpiled JS. They are still available in declaration files.
- Renamed `File` to `FileBuilder`.
- Changed File format.
- Changed instance system.
- Changed Content Identifier format to bech32.

### Added

- Added modules `ascii`, `bip39`, `common`, `ecdsa`, `encrypt`, `events`, `fs`, `http/client`, `http/server`, `identity`, `in-memory`, `instance`, `keyrings`, `media-types`, `sqlite`, `varint`, and `wraps`.
- Added `validateRequest` function for runtime validation of RPC request messages.
- Added request handlers for content procedures.
- Added `MaybePromise` support for `RPCClientStrategy` procedure implementations.
- Added `FileBuilder` instance serialization.

### Fixed

- Fixed `ContentIdentifier` instance serialization.
- Fixed a rogue conditional `&&` where it should have been `||` while checking for null content in `getContent`.

## [0.4.0](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.4.0) - 2024-09-21

### Breaking

- Removed the channels system in favour of more powerful RPC system. IndexedDB and S3 have been upgraded to use this system.
- Binary middleware is now scoped only to the JSON codec.
- Renamed `deleteOne`, `getOne`, `putOne` to `deleteContent`, `getContent`, `putContent` respectively.
- Separate module for hashes.
- Improvements to make `Registry` construction nicer.

### Added

- Added remote procedure call (RPC) system.
- Added registry for hash functions.
- Add support for codec-scoped middleware.

## [0.3.1](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.3.1) - 2024-09-11

### Breaking

- Renamed `IdentifierRegistry` to `SchemeRegistry`. `IdentifierRegistry` still works, but is deprecated.

### Added

- Added experimental (untested) support for the mutable `ContentIdentifierScheme`.

### Deprecated

- Deprecated usage of `getImmutable` without passing a type parameter.
- Deprecated `IdentifierRegistry` in favour of `SchemeRegistry`.

## [0.3.0](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.3.0) - 2024-09-10

### Breaking

- Renamed `IdentiferSchema` to `ContentIdentifierScheme`.
- Replaced `Identifier` with `ContentIdentifier`.
  - The constructor now accepts only a single argument.
  - `.type` now returns a `Varint` parser.
  - `.value` is now `.rawValue`.
  - `.toString` is now an alias of `.toBase58`.
- Changed `Hash`:
  - The constructor now accepts only a single argument.
  - Replaced `toBytes()` with `.bytes`.
  - `.algorithm` now returns a `Varint` parser.
- `File` is now generic and accepts the type argument. The `getValue` & `setValue` methods no longer need a type argument.
- Immutable scheme now parses and returns a `File` instance.
- `getImmutable` now returns a `File` instance.
- `putImmutable` now returns a `ContentIdentifier` instead of `Hash`.

### Added

- Added `ContentIdentifierLike` convenience type.

## [0.2.0](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.2.0) - 2024-09-04

:seedling: Initial release as Astrobase.

### Added

#### Channels

- IndexedDB
- S3 (and S3-compatible APIs)

#### Codecs

- Binary (`application/octet-stream`)
- JSON (`application/json`)

#### Content Identifier Schemes

- Immutable

#### Other

- Implement core functionality
- Add channels system
- Add codecs system
- Add identifiers system
- Add middleware system
- Add ASCII, media type, and varint parsers
- Support file protocol version 1
