module.exports = {
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: false,
    collectCoverageFrom: ['./src/TypeScript/**/*.ts'],
    coverageReporters: ['lcov'],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/TypeScript/types',
        '<rootDir>/src/TypeScript/stubs',
        '<rootDir>/src/TypeScript/app/core/interfaces',
    ],
    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: ['./node_modules', './src/TypeScript/types'],
    // An array of file extensions your modules use
    moduleFileExtensions: ['ts', 'js', 'json', 'node', 'd.ts', 'tsx'],
    moduleNameMapper: {
        '^N/(.*)': '<rootDir>/node_modules/@hitc/netsuite-types/N/$1',
        '^@uif-js/core$': '<rootDir>/src/TypeScript/stubs/@uif-js/core.ts',
        '^@uif-js/component$': '<rootDir>/src/TypeScript/stubs/@uif-js/component.ts',
        '^@uif-js/core/jsx-runtime$': '<rootDir>/src/TypeScript/stubs/@uif-js/core/jsx-runtime.ts',
        '^@app/(.*)$': '<rootDir>/src/TypeScript/app/$1', //jest
    },
    // A preset that is used as a base for Jest's configuration
    preset: 'ts-jest',
    // A list of paths to directories that Jest should use to search for files in
    roots: ['./test/unit', './src/TypeScript'],
    // The test environment that will be used for testing
    testEnvironment: 'node',
    // The glob patterns Jest uses to detect test files
    testMatch: ['**/?(*.)+(Spec|test).ts'],
    transform: {
        '^.*tsx?$': 'ts-jest'
    },
    // Indicates whether each individual test should be reported during the run
    verbose: true,
    transformIgnorePatterns: ['node_modules/(?!(@hitc))'],
    restoreMocks: true
};
