import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import ts from 'typescript-eslint';

export default ts.config(
  {
    ignores: ['coverage/', 'dist/', 'docs/', 'tmp/'],
  },
  eslint.configs.recommended,
  ...ts.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettier,
  {
    rules: {
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-invalid-void-type': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/related-getter-setter-pairs': 'warn',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-console': 'error',
      'no-debugger': 'error',
      'prettier/prettier': 'warn',
    },
  },
);
