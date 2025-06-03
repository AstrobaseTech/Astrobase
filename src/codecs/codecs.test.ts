/* eslint-disable @typescript-eslint/unbound-method */

import { parse } from 'content-type';
import { describe, expect, test, vi } from 'vitest';
import { createInstance, InstanceReferenceError } from '../instance/instance.js';
import type { Middleware } from '../middleware/types.js';
import { decodeWithCodec, encodeWithCodec, type Codec } from './codecs.js';

const randomPayload = crypto.getRandomValues(new Uint8Array(8));

describe('Codec unavailable behaviour', () => {
  const emptyInstance = createInstance();
  const mediaType = 'test/no-codec';

  const error = new InstanceReferenceError('codecs', mediaType);

  for (const fn of [decodeWithCodec, encodeWithCodec]) {
    test(fn.name, () => expect(fn(emptyInstance, randomPayload, mediaType)).rejects.toThrow(error));
  }
});

describe('Codec encode, decode', () => {
  const mediaType = 'test/encode-decode';

  const codec: Codec<Uint8Array> = {
    decode: vi.fn((p: Uint8Array) => p),
    encode: vi.fn((p: Uint8Array) => p),
  };

  const instance = createInstance({
    codecs: { [mediaType]: codec },
  });

  test(decodeWithCodec.name, async () => {
    await expect(decodeWithCodec(instance, randomPayload, mediaType)).resolves.toEqual(
      randomPayload,
    );
    expect(codec.decode).toHaveBeenCalledOnce();
    expect(codec.encode).not.toHaveBeenCalled();
  });

  test(encodeWithCodec.name, async () => {
    await expect(encodeWithCodec(instance, randomPayload, mediaType)).resolves.toEqual(
      randomPayload,
    );
    expect(codec.decode).toHaveBeenCalledOnce();
    expect(codec.encode).toHaveBeenCalledOnce();
  });
});

describe('Codec scoped middleware', () => {
  const mediaType = 'test/codec-scoped-middleware';

  const middleware: Middleware = {
    replacer: vi.fn((_, v: unknown) => v),
    reviver: vi.fn((_, v: unknown) => v),
  };

  const codec: Codec<Uint8Array> = {
    decode: (p) => p,
    encode: (p) => p,
    middlewares: [middleware],
  };

  const instance = createInstance({
    codecs: { [mediaType]: codec },
  });

  test(decodeWithCodec.name, async () => {
    await expect(decodeWithCodec(instance, randomPayload, mediaType)).resolves.toEqual(
      randomPayload,
    );
    expect(middleware.reviver).toHaveBeenCalledExactlyOnceWith(undefined, randomPayload, instance);
  });

  test(encodeWithCodec.name, async () => {
    await expect(encodeWithCodec(instance, randomPayload, mediaType)).resolves.toEqual(
      randomPayload,
    );
    expect(middleware.replacer).toHaveBeenCalledExactlyOnceWith(undefined, randomPayload, instance);
  });
});

describe('Middleware pipeline order', () => {
  const mediaType = 'test/pipelines';

  const instanceMiddleware: Middleware = {
    replacer: vi.fn((_, v: unknown) => (v === 'value' ? 'instanceMiddleware' : v)),
    reviver: vi.fn((_, v: unknown) => (v === 'codecMiddleware' ? 'instanceMiddleware' : v)),
  };

  const codecMiddleware: Middleware = {
    replacer: vi.fn((_, v: unknown) => (v === 'instanceMiddleware' ? 'codecMiddleware' : v)),
    reviver: vi.fn((_, v: unknown) => (v === 'codec' ? 'codecMiddleware' : v)),
  };

  const decode = vi.fn((v: Uint8Array) => new TextDecoder().decode(v));
  const encode = vi.fn((v: string) =>
    new TextEncoder().encode(v === 'codecMiddleware' ? 'codec' : v),
  );

  const codec: Codec = { decode, encode, middlewares: [codecMiddleware] };

  const instance = createInstance({
    codecs: { [mediaType]: codec },
    middlewares: [instanceMiddleware],
  });

  const codecStrBytes = new TextEncoder().encode('codec');

  test('Decode pipeline', async () => {
    await expect(decodeWithCodec(instance, codecStrBytes, mediaType)).resolves.toEqual(
      'instanceMiddleware',
    );

    expect(instanceMiddleware.reviver).toHaveBeenCalledExactlyOnceWith(
      undefined,
      'codecMiddleware',
      instance,
    );
    expect(instanceMiddleware.reviver).toHaveReturnedWith('instanceMiddleware');

    expect(codecMiddleware.reviver).toHaveBeenCalledExactlyOnceWith(undefined, 'codec', instance);
    expect(codecMiddleware.reviver).toHaveReturnedWith('codecMiddleware');

    expect(decode).toHaveBeenCalledExactlyOnceWith(codecStrBytes, {
      instance,
      mediaType: parse(mediaType),
    });
    expect(decode).toHaveReturnedWith('codec');
  });

  test('Encode pipeline', async () => {
    await expect(encodeWithCodec(instance, 'value', mediaType)).resolves.toEqual(codecStrBytes);

    expect(instanceMiddleware.replacer).toHaveBeenCalledExactlyOnceWith(
      undefined,
      'value',
      instance,
    );
    expect(instanceMiddleware.replacer).toHaveReturnedWith('instanceMiddleware');

    expect(codecMiddleware.replacer).toHaveBeenCalledExactlyOnceWith(
      undefined,
      'instanceMiddleware',
      instance,
    );
    expect(codecMiddleware.replacer).toHaveReturnedWith('codecMiddleware');

    expect(encode).toHaveBeenCalledExactlyOnceWith('codecMiddleware', {
      instance,
      mediaType: parse(mediaType),
    });
    expect(encode).toHaveReturnedWith(codecStrBytes);
  });
});
