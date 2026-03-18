const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const absoluteImportPatterns = [
  {
    group: ['./*', '../*', '../../*', '../../../*', '../../../../*', '../../../../../*'],
    message: 'Use the @/ absolute import alias instead of relative imports.',
  },
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      '.expo/**',
      '.github/**',
      '.tmp-home/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
    ],
  },
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: {
          project: 'tsconfig.json',
        },
      },
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: absoluteImportPatterns }],
    },
  },
]);
