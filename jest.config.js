/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  }, testPathIgnorePatterns: [
    "src/config/environment/test.ts",
    "src/database/database.test.service.ts"
  ],
};