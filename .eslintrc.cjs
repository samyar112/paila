module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
  ],
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  ignorePatterns: ['node_modules/', 'ios/', 'android/', 'build/', 'dist/'],
  rules: {
    'security/detect-object-injection': 'off',
  },
};
