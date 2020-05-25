module.exports = {
    moduleFileExtensions: [
        'js',
    ],
    modulePathIgnorePatterns: [
        'contracts/',
        '__tests__/_/',
    ],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
    ],
};
