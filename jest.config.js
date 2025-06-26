export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/test/**/*.test.js',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    'index.js',
    'cli.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
}; 