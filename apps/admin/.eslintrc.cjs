module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'airbnb', 'plugin:jsx-a11y/recommended', 'plugin:prettier/recommended', 'plugin:import/recommended', 'plugin:import/typescript', 'plugin:jsx-a11y/recommended', 'plugin:prettier/recommended', 'plugin:@tanstack/eslint-plugin-query/recommended', 'plugin:storybook/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs','node_modules', '.turbo'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'react', 'prettier', 'simple-import-sort'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'max-len': 'off',
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'object-curly-newline': 'off',
    'arrow-parens': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-nested-ternary': 'off',
    'nonblock-statement-body-position': ['error', 'any'],
    camelcase: 'error',
    'consistent-return': 0,
    'no-restricted-syntax': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'arrow-body-style': ['error', 'as-needed'],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-shadow': 'error',
    'no-underscore-dangle': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-explicit-any': 2,
    '@typescript-eslint/no-empty-interface': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-shadow': ['error'],
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/prop-types': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.tsx', '.stories.tsx'],
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['vite.config.js'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {},
    },
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
      rules: {
        'storybook/hierarchy-separator': 'error',
        'storybook/default-exports': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['**/mocks/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['*.@(queries|requests).ts'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['**/utils/*.*'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Style imports.
              ['^.+\\.?(css)$'],
              // Packages `react` related
              ['^react', '^@?\\w'],
              // Peer packages.
              ['^@mejjos(/.*|$)'],
              // Internal packages.
              ['^(@|components)(/.*|$)'],
              // Side effect imports.
              ['^\\u0000'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ],
          },
        ],
      },
    },
  ],
}