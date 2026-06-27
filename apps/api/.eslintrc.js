module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'error',
    'object-shorthand': 'error',
  },
  overrides: [
    {
      files: [
        'src/admin/auth/seeder/admin.seeder.ts',
        'src/console.ts',
        'src/file/file.processor.ts',
        'src/prisma/createAdminUser.ts',
        'src/prisma/index.ts',
        'test/setup.ts',
      ],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
