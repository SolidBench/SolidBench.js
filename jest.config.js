/** @type {import('jest').Config} */
module.exports = {
  transform: {
    '^.+\\.ts$': [ 'ts-jest' ],
  },
  testRegex: [ '/test/.+-test.ts$' ],
  testPathIgnorePatterns: [
    '.*.d.ts',
  ],
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
