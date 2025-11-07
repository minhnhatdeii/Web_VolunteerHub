export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.js'],
  setupFilesAfterEnv: [],
  collectCoverageFrom: [
    'utils/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    '!routes/index.js', // Exclude main routes index
  ],
  transform: {}
};