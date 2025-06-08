---
title: Encryption
banner:
  content: Welcome to the Astrobase SDK documentation. This area is currently under development.
---

`@astrobase/sdk/encrypt` provides an API for encrypting and decrypting content symmetrically with a passphrase or Identity key pair, and also implements a Wrap strategy using this API.

This module implements only symmetric encryption using either a passphrase or a private key from the Keyring. Both approaches use KDF. Asymmetric encryption is not yet implemented.
