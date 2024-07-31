import type { Codec } from '../../src/immutable/codecs.js';

export const mockJSONCodec = {
  key: 'application/json',
  decode(data) {
    return JSON.parse(new TextDecoder().decode(data)) as unknown;
  },
  encode(data) {
    return new TextEncoder().encode(JSON.stringify(data));
  },
} satisfies Codec;
