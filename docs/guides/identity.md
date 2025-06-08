---
title: Identity
banner:
  content: Welcome to the Astrobase SDK documentation. This area is currently under development.
---

With the identity scheme, a public key from an asymmetric key pair is embedded in the content identifier. The content itself includes a content identifier reference and must be a valid ECDSA signature wrap payload verifiable with the same public key in the content identifier. This way, only the private key holder can mutate the reference.

Identities are derived from the active keyring using BIP32 - so a single keyring can generate many identities. This allows one person to manage only one keyring (and by extension memorize only one recovery phrase) and spawn off many segregated identities for different apps or contexts (personal, work, etc.)
