module.exports = {
  ignorePatterns: ['dist/*', 'docs/*'], // disable docs temporarily
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    'max-len': ['error', { code: 120 }],
    'import/prefer-default-export': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'no-restricted-syntax': 'off',
    'max-len': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
};
