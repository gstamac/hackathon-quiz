const restrictedSyntax = [
  'ForInStatement',
  'ClassDeclaration'
]

module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'jest': true
    // 'jest/globals': true
  },
  "globals": {
    "page": true,
    "browser": true,
    "context": true,
    "jestPuppeteer": true
  },
  'ignorePatterns': [
    'node_modules',
    'dist',
    'coverage',
    'src/json/*.json',
    'tests/setupTests.ts',
    'src/images/custom.d.ts',
    'src/react-app-env.d.ts',
    'src/serviceWorker.ts',
    'src/setupTests.ts',
    'src/components/qr-widget/qr-library/artqrcode.js'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'project': 'tsconfig.lint.json',
    'sourceType': 'module'
  },
  'plugins': [
    '@globalid',
    'react-hooks',
  ],
  "extends": [
    "plugin:@globalid/react"
  ],
  'overrides': [
    {  // TODO: this is just temp
      'files': ['*.*'],
      'rules': {
        'linebreak-style': 'off',
        'no-invalid-this': 'off',  // TODO: disabled for now - error in assigned functions
        'indent': ['error' , 2],
        '@typescript-eslint/indent': 'off',     // TODO: doesn't work correctly for now
        '@typescript-eslint/no-throw-literal': 'off',  // TODO: doesn't work
        '@typescript-eslint/no-use-before-define': 'off', // TODO: disabled for now but should be reevaluated
        '@typescript-eslint/strict-boolean-expressions': 'off', // TODO: temp disabled -- 9
        '@typescript-eslint/prefer-optional-chain': 'off', // TODO: doesn't work
        '@typescript-eslint/no-unsafe-member-access': 'off', // TODO: too many issues now with test files https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unsafe-member-access.md
        '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: too many issues now with test files https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unsafe-assignment.md
        '@typescript-eslint/no-unsafe-call': 'off', // TODO: too many issues now with test files https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unsafe-call.md
        '@typescript-eslint/restrict-template-expressions': 'off', // TODO: too many issues for now, https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/restrict-template-expressions.md
        '@typescript-eslint/no-unsafe-return': 'off', // TODO: too many issues now with test files, specially with jest.fn and mock functions
        '@typescript-eslint/ban-types': 'off', // TODO: we should try to now use Function, Object, any as a variable type in our project
        'prefer-arrow/prefer-arrow-functions': 'off', // TODO: too many issues now, replace all functions with arrow functions,
        'no-shadow': 'off', // TODO: typescript/eslint new version has an issue with enum values
        '@typescript-eslint/no-shadow': ['error', { 'ignoreTypeValueShadow': true }],// TODO: typescript/eslint new version has an issue with enum values

        'no-magic-numbers': 'off', // TODO: disabled for now but should be enabled
        // TODO: eslint-import extension is very slow
        'import/no-absolute-path': 'off',
        'import/no-self-import': 'off',
        'import/no-cycle': 'off',
        'import/no-useless-path-segments': 'off',
        'import/no-relative-parent-imports': 'off',

        'import/no-mutable-exports': 'off',
        'import/no-unused-modules': 'off',

        'import/no-namespace': 'off',
        'import/extensions': 'off',

        'unicorn/no-unsafe-regex': 'off', // TODO: temp disabled - I have no idea why this would be usefull -- 3
        'unicorn/prefer-spread': 'off', // TODO: disabled because Array.from needs to be used for Set, HTMLCollection, etc

        'jest/prefer-called-with': 'off', // TODO: temp disabled, too many errors
        'jest/no-disabled-tests': 'off', // TODO: temp disabled, too many errors

        'prefer-arrow/prefer-arrow-functions': 'off', // TODO: too many issues now
  
        'react-hooks/rules-of-hooks': 'error',
        // 'react-hooks/exhaustive-deps': 'error',

        'no-multiple-empty-lines': ["error", { "max": 1, "maxEOF": 1, "maxBOF": 0 }],
        'func-style': ["error", "expression"],
        '@typescript-eslint/explicit-function-return-type': ["error", {
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
          allowExpressions: true,
        }],

        'keyword-spacing': ['error', { 'before': true , 'after': true }],
        'arrow-spacing': ['error', { before: true, after: true }],
        'comma-dangle': ['error', 'always-multiline'],
        'no-trailing-spaces': 'error',
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*'},
          { blankLine: 'any',    prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
          { blankLine: 'always', prev: '*', next: 'return' },
        ],
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'none',
              requireLast: true
            },
            singleline: {
              delimiter: 'comma',
              requireLast: false
            },
          }
        ],
        'semi': 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/typedef': [
          'error',
          {
            arrayDestructuring: false,
            arrowParameter: false,
            memberVariableDeclaration: false,
            objectDestructuring: false,
            parameter: true,
            propertyDeclaration: true,
            variableDeclaration: false,
            variableDeclarationIgnoreFunction: false,
          }
        ],
      },
    },   
  ]
}
