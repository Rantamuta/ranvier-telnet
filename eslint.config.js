const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', 'vendor/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      'no-buffer-constructor': 'error',
    },
  },
];
