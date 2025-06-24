const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    transformIgnorePatterns: [
        '/node_modules/(?!react-syntax-highlighter)'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        'react-syntax-highlighter': '<rootDir>/__mocks__/react-syntax-highlighter.js',
    },
    moduleDirectories: ['node_modules', '<rootDir>/'],
}

module.exports = createJestConfig(config)
