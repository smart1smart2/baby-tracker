/** @type {import('jest').Config} */
module.exports = {
  // Pure-logic tests don't need a React Native runtime; ts-jest is faster
  // than jest-expo for unit tests over plain TS modules. Add a separate
  // project / preset later if/when component tests via RNTL need the
  // Expo bundle.
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
