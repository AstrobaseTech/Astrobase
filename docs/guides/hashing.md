---
title: Hashing
banner:
  content: Welcome to the Astrobase SDK documentation. This area is currently under development.
---

`@astrobase/sdk/hashing` provides functionality related to cryptographic hash functions and serializing hash digests. Hashing algorithms are identifiable via an integer identifier, for instance `0` is the identifier for SHA-256. Implementations for different algorithms may be provided in the Instance config. Hashes are typically prefixed with the hashing algorithm identifier when serialized, including when they form part of an immutable content identifier.
