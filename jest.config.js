const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Force cheerio to use its CommonJS build in Jest
    '^cheerio$': '<rootDir>/node_modules/cheerio/dist/commonjs/index.js',
  },
}
module.exports = createJestConfig(customJestConfig)