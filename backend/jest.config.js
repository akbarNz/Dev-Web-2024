module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.js'],
    verbose: true,
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
    testTimeout: 10000
};