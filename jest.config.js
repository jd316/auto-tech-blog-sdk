export default {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js',
  ],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
