// @ts-expect-error
import eslint from '@eslint/js';
// @ts-expect-error
import prettier from 'eslint-plugin-prettier/recommended';
import ts from 'typescript-eslint';

export default ts.config(
  {
    ignores: ['coverage/', 'dist/', 'docs/', 'tmp/'],
  },
  eslint.configs.recommended,
  ...ts.configs.strict,
  prettier,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-invalid-void-type': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'error',
      'no-debugger': 'error',
      'prettier/prettier': 'warn',
    },
  },
);
