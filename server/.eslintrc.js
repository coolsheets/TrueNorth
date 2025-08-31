/* eslint-env node */
module.exports = {
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn'
  },
  globals: {
    module: true,
    require: true,
    process: true,
    console: true
  }
};
