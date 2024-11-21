import { parse } from 'content-type';
import mediaTypes from 'mime-db';
import { describe, expect, test, vi } from 'vitest';
import { registerMiddleware, type Middleware } from '../middleware/index.js';
import {
  CodecRegistry,
  decodeWithCodec,
  DefaultMediaType,
  encodeWithCodec,
  type Codec,
} from './codecs.js';

const fn = (p: Uint8Array) => p;
const validStrategy = { decode: fn, encode: fn };

describe('CodecRegistry', () => {
  const sdkSupportedKeys = Object.values(DefaultMediaType);
  const validKeys = [...Object.keys(mediaTypes), 'valid/media-type'];
  const invalidKeys = [23, 'applicationjson', 'application/json/'] as never[];

  const validStrategies = [validStrategy];
  const invalidStrategies = [
    {},
    { decode: fn },
    { encode: fn },
    { decode: fn, encode: fn, middlewares: {} },
    // { decode: fn, encode: fn, middlewares: ['!!!'] }, // TODO(fix): we should validate each entry
  ] as never[];

  for (let i = 0; i < validStrategies.length; i++) {
    const strategy = validStrategies[i];

    for (const key of validKeys) {
      const instanceID = `validStrategies[${i}], ${key} - works`;
      test(instanceID, () => {
        expect(CodecRegistry.get(key, instanceID))[
          sdkSupportedKeys.includes(key as never) ? 'toBeDefined' : 'toBeUndefined'
        ]();
        expect(() => CodecRegistry.register({ key, strategy }, { instanceID })).not.toThrow();
        expect(CodecRegistry.get(key, instanceID)).toBe(strategy);
      });
    }

    for (const key of invalidKeys) {
      const instanceID = `validStrategies[${i}], ${key as string} - key error`;
      test(instanceID, () => {
        expect(CodecRegistry.get(key, instanceID)).toBeUndefined();
        expect(() => CodecRegistry.register({ key, strategy }, { instanceID })).toThrow(
          'Invalid key',
        );
        expect(CodecRegistry.get(key, instanceID)).toBeUndefined();
      });
    }
  }

  for (let i = 0; i < invalidStrategies.length; i++) {
    const strategy = invalidStrategies[i];

    for (const key of validKeys) {
      const instanceID = `invalidStrategies[${i}], ${key} - strategy error`;
      test(instanceID, () => {
        const fnName = sdkSupportedKeys.includes(key as never) ? 'toBeDefined' : 'toBeUndefined';
        expect(CodecRegistry.get(key, instanceID))[fnName]();
        expect(() => CodecRegistry.register({ key, strategy }, { instanceID })).toThrow(
          'Invalid strategy',
        );
        expect(CodecRegistry.get(key, instanceID))[fnName]();
      });
    }

    for (const key of invalidKeys) {
      const instanceID = `invalidStrategies[${i}], ${key as string} - strategy error`;
      test(instanceID, () => {
        expect(CodecRegistry.get(key, instanceID)).toBeUndefined();
        expect(() => CodecRegistry.register({ key, strategy }, { instanceID })).toThrow(
          'Invalid strategy',
        );
        expect(CodecRegistry.get(key, instanceID)).toBeUndefined();
      });
    }
  }
});

const input = crypto.getRandomValues(new Uint8Array(8));

test('decodeWithCodec & encodeWithCodec throw if no codec available', async () => {
  const type = 'test/no-codec';
  const instanceID = type;
  for (const mediaType of [type, { type }]) {
    for (const fn of [decodeWithCodec, encodeWithCodec]) {
      await expect(fn(input, mediaType, instanceID)).rejects.toThrow('Strategy not found');
    }
  }
});

test('decodeWithCodec & encodeWithCodec both work', async () => {
  const key = 'test/decode-encode';
  const instanceID = key;
  CodecRegistry.register({ strategy: validStrategy }, { key, instanceID });
  for (const k of [key, { type: key }]) {
    for (const fn of [decodeWithCodec, encodeWithCodec]) {
      await expect(fn(input, k, instanceID)).resolves.toEqual(input);
    }
  }
});

test('decodeWithCodec & encodeWithCodec use codec scoped middleware correctly', async () => {
  const key = 'test/codec-scoped-middleware';
  const instanceID = key;
  const middleware = {
    replacer: vi.fn((_: unknown, v: unknown) => v),
    reviver: vi.fn((_: unknown, v: unknown) => v),
  };
  CodecRegistry.register(
    { strategy: { decode: fn, encode: fn, middlewares: [middleware] } },
    { key, instanceID },
  );
  for (const k of [key, { type: key }]) {
    for (const fn of [decodeWithCodec, encodeWithCodec]) {
      await expect(fn(input, k, instanceID)).resolves.toEqual(input);
    }
  }
  for (const fn of [middleware.replacer, middleware.reviver]) {
    expect(fn).toBeCalledTimes(2);
    expect(fn).lastCalledWith(undefined, input, { instanceID });
  }
});

describe('Middleware pipelines', () => {
  // decode = binary-->--codec---------------->--codec middleware-->--instance middleware-->--output

  const key = 'test/pipelines';
  const instanceID = key;

  const instanceMiddleware: Middleware = {
    replacer: vi.fn((_: unknown, v: unknown) => (v === 'value' ? 'instanceMiddleware' : v)),
    reviver: vi.fn((_: unknown, v: unknown) =>
      v === 'codecMiddleware' ? 'instanceMiddleware' : v,
    ),
  };

  const codecMiddleware: Middleware = {
    replacer: vi.fn((_: unknown, v: unknown) =>
      v === 'instanceMiddleware' ? 'codecMiddleware' : v,
    ),
    reviver: vi.fn((_: unknown, v: unknown) => (v === 'codec' ? 'codecMiddleware' : v)),
  };

  const decode = vi.fn((v: Uint8Array) => new TextDecoder().decode(v));
  const encode = vi.fn((v: string) =>
    new TextEncoder().encode(v === 'codecMiddleware' ? 'codec' : v),
  );

  const codec: Codec = { decode, encode, middlewares: [codecMiddleware] };

  CodecRegistry.register({ strategy: codec }, { instanceID, key });
  registerMiddleware(instanceMiddleware, instanceID);

  test('Decode pipeline', async () => {
    await expect(
      decodeWithCodec(new Uint8Array([99, 111, 100, 101, 99]), key, instanceID),
    ).resolves.toEqual('instanceMiddleware');

    expect(instanceMiddleware.reviver).toBeCalledTimes(1);
    expect(instanceMiddleware.reviver).lastCalledWith(undefined, 'codecMiddleware', { instanceID });
    expect(instanceMiddleware.reviver).toHaveReturnedWith('instanceMiddleware');

    expect(codecMiddleware.reviver).toBeCalledTimes(1);
    expect(codecMiddleware.reviver).lastCalledWith(undefined, 'codec', {
      instanceID,
    });
    expect(codecMiddleware.reviver).toHaveReturnedWith('codecMiddleware');

    expect(decode).toBeCalledTimes(1);
    expect(decode).lastCalledWith(new Uint8Array([99, 111, 100, 101, 99]), {
      instanceID,
      mediaType: parse(key),
    });
    expect(decode).toHaveReturnedWith('codec');
  });

  test('Encode pipeline', async () => {
    await expect(encodeWithCodec('value', key, instanceID)).resolves.toEqual(
      new Uint8Array([99, 111, 100, 101, 99]),
    );

    expect(instanceMiddleware.replacer).toBeCalledTimes(1);
    expect(instanceMiddleware.replacer).lastCalledWith(undefined, 'value', { instanceID });
    expect(instanceMiddleware.replacer).toHaveReturnedWith('instanceMiddleware');

    expect(codecMiddleware.replacer).toBeCalledTimes(1);
    expect(codecMiddleware.replacer).lastCalledWith(undefined, 'instanceMiddleware', {
      instanceID,
    });
    expect(codecMiddleware.replacer).toHaveReturnedWith('codecMiddleware');

    expect(encode).toBeCalledTimes(1);
    expect(encode).lastCalledWith('codecMiddleware', {
      instanceID,
      mediaType: parse(key),
    });
    expect(encode).toHaveReturnedWith(new Uint8Array([99, 111, 100, 101, 99]));
  });
});
