const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
    rules: {
      'import/no-nodejs-modules': 'off',
      'ts/naming-convention': 'off',
    },
  },
  {
    files: [ '**/commands/*.ts' ],
    rules: {
      'antfu/top-level-function': 'off',
      'ts/no-unsafe-assignment': 'off',
    },
  },
]);
