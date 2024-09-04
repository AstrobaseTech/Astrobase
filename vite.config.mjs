import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  envPrefix: 'TEST_',
  test: {
    coverage: {
      exclude: ['docs/**', '**/index.[jt]s', 'src/core.ts', ...coverageConfigDefaults.exclude],
    },
  },
});
