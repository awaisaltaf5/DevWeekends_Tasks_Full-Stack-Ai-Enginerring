const path = require('path');

/**
 * Jest configuration.
 *
 * A dedicated config file is used (rather than the "jest" key in
 * package.json) so that setupFilesAfterEnv resolves the setup script via an
 * absolute path, avoiding any cross-platform module-resolution ambiguity.
 */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  rootDir: '.',
  setupFilesAfterEnv: [path.resolve(__dirname, 'src', 'tests', 'setup.js')],
  testMatch: ['**/tests/**/*.test.js'],
};
