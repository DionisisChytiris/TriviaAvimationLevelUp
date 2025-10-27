module.exports = {
  root: true,
  env: { es2021: true, node: true },
  extends: ['@react-native', 'plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {},
    },
    {
      files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/?(*.)+(spec|test).{ts,tsx,js,jsx}'],
      env: { jest: true },
    },
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
