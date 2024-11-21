# Changelog

## Unreleased

### Added

- Added a `filesystem` RPC client for content procedures via `@astrobase/core/fs`.
- Added a `http` RPC server via `@astrobase/core/http`.
- Added a `astrobase` HTTP daemon binary.

### Changed

- Changed middleware processing to recurse on arrays and simple objects only.
- Changed middleware processing to skip number and boolean primitive types.

### Fixed

- Fixed `ContentIdentifier` instance serialization.
- Made `putMutable` options param optional.
- Fixed a rogue conditional `&&` where it should have been `||` while checking for null content in `getContent`.

## [0.4.0](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.4.0) - 2024-09-21

### Added

- Added remote procedure call (RPC) system.
- Added registry for hash functions.
- Add support for codec-scoped middleware.

### Changed

- Removed the channels system in favour of more powerful RPC system. IndexedDB and S3 have been upgraded to use this system.
- Binary middleware is now scoped only to the JSON codec.
- Renamed `deleteOne`, `getOne`, `putOne` to `deleteContent`, `getContent`, `putContent` respectively.
- Separate module for hashes.
- Improvements to make `Registry` construction nicer.

## [0.3.1](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.3.1) - 2024-09-11

### Added

- Added experimental (untested) support for the mutable `ContentIdentifierScheme`.

### Changed

- Renamed `IdentifierRegistry` to `SchemeRegistry`. `IdentifierRegistry` still works, but is deprecated.

### Deprecated

- Deprecated usage of `getImmutable` without passing a type parameter.
- Deprecated `IdentifierRegistry` in favour of `SchemeRegistry`.

## [0.3.0](https://github.com/AstrobaseTech/Astrobase/releases/tag/v0.3.0) - 2024-09-10

### Added

- Added `ContentIdentifierLike` convenience type.

### Changed

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
