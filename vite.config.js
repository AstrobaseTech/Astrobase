import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  envPrefix: 'TEST_',
  test: {
    coverage: {
      include: ['src/**'],
      exclude: ['docs/**', '**/index.[jt]s', 'src/core.ts', ...coverageConfigDefaults.exclude],
    },
  },
});
