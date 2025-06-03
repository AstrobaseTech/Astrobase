/**
 * Provides an API for encrypting and decrypting content symmetrically with a passphrase or Identity
 * key pair. Or provides a Wrap strategy.
 *
 * This module implements only symmetric encryption using either a passphrase or a private key from
 * the Keyring. Both approaches use KDF. Asymmetric encryption is not yet implemented.
 *
 * @module Encrypt
 * @category API Reference
 * @experimental
 */

export * from './encrypt.js';
export * from './wrap.js';
