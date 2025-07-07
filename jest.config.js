const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-fixed-jsdom',
    transformIgnorePatterns: [
        '/node_modules/(?!react-syntax-highlighter)'
    ],
    moduleNameMapper: {
        '^@/prisma$': '<rootDir>/src/lib/prisma.ts',
        '^@/(.*)$': '<rootDir>/src/$1',
        'react-syntax-highlighter': '<rootDir>/__mocks__/react-syntax-highlighter.js',
    },
    moduleDirectories: ['node_modules', 'src'],
    coverageProvider: "v8",
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/index.ts"],
    coverageDirectory: "coverage"
}

module.exports = createJestConfig(config)
