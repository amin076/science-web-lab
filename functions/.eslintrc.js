/* eslint-env node */

module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "require-jsdoc": "off",
    "max-len": "off",
  },
};