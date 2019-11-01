/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

module.exports = {
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  preset: 'ts-jest',
  testMatch: null,
  moduleNameMapper: {
    'workerize-proxy-loader!@frontarm/demoboard-worker':
      '<rootDir>/test/mocks/demoboardWorker.mock.ts',
    'file-loader!@frontarm/demoboard-runtime/dist/demoboard-runtime.js':
      '<rootDir>/test/mocks/demoboard-runtime.mock.js',
  },
  setupFiles: ['jsdom-worker', '<rootDir>/test/setup.js'],
  globals: {
    'ts-jest': {
      babelConfig: null,
      diagnostics: false,
    },
  },
}
