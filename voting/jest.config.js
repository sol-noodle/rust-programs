/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "programs/**/*.ts",
    "!**/node_modules/**",
    "!**/target/**",
  ],
  testTimeout: 30000,
  verbose: true,
};
