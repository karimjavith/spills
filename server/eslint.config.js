import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,

  // TS + JS in server
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // or vitest if you use it
      },
    },
    rules: {
      // keep this lightweight; prettier handles formatting
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.test.{js,ts}'],
    rules: {
      // tests can be looser if you want
    },
  },
];
