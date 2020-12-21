module.exports = {
  "coverageDirectory": 'coverage',
  "coverageReporters": [
    "html"
  ],
  "roots": [
    "<rootDir>/src",
    "<rootDir>/tests",
  ],

  "testMatch": [
    '<rootDir>/tests/unit/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(spec|test).(ts|tsx)',
  ],

  "testPathIgnorePatterns": [
    "<rootDir>/tests/setupTests.ts",
    "<rootDir>/tests/jest_extend.ts"
  ],

  "testURL": "http://localhost:3000/#token=test.mock-token",

  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
    "mjs"
  ],

  "setupFiles": ["<rootDir>/tests/setupTests.ts"],

  "setupFilesAfterEnv": ["<rootDir>/tests/jest_extend.ts"],
}
