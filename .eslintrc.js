module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    semi: 'error',
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'max-len': ['error', { code: 140 }],
  },
};
