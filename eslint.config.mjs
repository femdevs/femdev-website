import jsDoc from "eslint-plugin-jsdoc";

const configs = {
  files: [
    '**/*.js',
  ],
  ignores: [
    'node_modules',
    'assets/scripts/Other/**/*.js',
    'assets/scripts/Other/*.js',
  ],
  plugins: {
    jsdoc: jsDoc,
  },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'arrow-spacing': 'error',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'camelcase': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'eol-last': 'error',
    'eqeqeq': 'error',
    'func-call-spacing': 'error',
    'jsdoc/check-values': 'error',
    'jsdoc/require-description': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': 'error',
    'max-len': ['error', { 'code': 150 }],
    'no-console': 'error',
    'prefer-const': 'error',
    'id-length': ['error', { 'min': 2, 'exceptions': ['k', 'v', '_'] }],
    'semi': 'error',
    'space-before-blocks': 'error',
  }
}

const MorseCodeOverrides = {
  files: ['**/morsecode.js'],
  rules: {
    'no-console': 'off',
    'id-length': 'off',
  }
}

export default [
  configs,
  MorseCodeOverrides,
];