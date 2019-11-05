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
    './worker/getWorker': '<rootDir>/test/mocks/getWorkerShim.ts',
  },
  globals: {
    'ts-jest': {
      babelConfig: null,
      diagnostics: false,
    },
  },
}
