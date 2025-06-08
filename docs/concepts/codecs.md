---
title: Codecs
banner:
  content: Welcome to the Astrobase SDK documentation. This area is currently under development.
---

The codec system allows for the encoding and decoding of data payloads based on their media type.

Codecs are an object that implements the [`Codec`] interface. They are mapped to media types via the config.

## Included Codecs

The following codecs are included with the [`Common`] config:

| Codec Name     | Media Type                   |
| -------------- | ---------------------------- |
| Binary         | `application/octet-stream`   |
| JSON           | `application/json`           |
| Astrobase Wrap | `application/astrobase-wrap` |

## Custom Codecs

To implement a custom codec, create an object that implements the [`Codec`] interface:

```ts
import type { Codec } from '@astrobase/sdk/codecs';

const customCodec: Codec<DeserializedType> = {
  decode(payload, { instance, mediaType }) {
    // Deserialize from binary back into the data
  },
  encode(data, { instance, mediaType }) {
    // Serialize the data into binary
  },
  middleware: [
    // Optionally provide codec-scoped middleware(s)
  ],
};
```

[`Codec`]: ../../api/codecs/interfaces/codec/
[`Common`]: ../../api/common/variables/common/
