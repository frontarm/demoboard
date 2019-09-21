module.exports = {
  extends: 'react-app',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'header'],
  settings: {
    react: {
      version: '16.8',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
    'header/header': [
      'error',
      'block',
      { pattern: ' Copyright (\\(c\\) )?\\d{4}' },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'styled-components',
            message: 'Please import from styled-components/macro.',
          },
        ],
        patterns: ['!styled-components/macro'],
      },
    ],
  },
}
