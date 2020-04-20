module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "indent": ["error", 4],
    "max-classes-per-file": "off",
    "object-property-newline": "off",
    "no-bitwise": "off",
    "prefer-object-spread": "off",
    "no-restricted-syntax": "off",
    "no-plusplus": "off",
    "class-methods-use-this": "off",
    "no-use-before-define": "off",
    "no-unused-vars":  ["error", { "vars": "local" }],
    "no-param-reassign": ["error", { "props": false }],
  },
};
