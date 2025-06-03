import { describe, expect, it } from 'vitest';
import { Varint } from './varint.js';

for (const [len, value, bytes] of [
  [1, 62, [62, 214, 10, 73, 69, 88, 130, 172]],
  [3, 148836, [228, 138, 137, 0, 87, 3, 59, 12]],
  [1, 8, [8, 103, 161, 1, 170, 254, 62, 71]],
  [3, 1060940, [204, 224, 64, 93, 223, 65, 29, 250]],
  [2, 9786, [186, 76, 187, 139, 185, 249, 32, 41]],
  [1, 72, [72, 111, 16, 151, 205, 243, 8, 91]],
] as const) {
  describe(JSON.stringify(bytes), () => {
    const instance = new Varint(new Uint8Array(bytes));

    it('Correctly parses encoding length', () => {
      expect(instance.encodingLength).toBe(len);
    });

    it('Correctly parses value', () => {
      expect(instance.value).toBe(value);
    });
  });
}
