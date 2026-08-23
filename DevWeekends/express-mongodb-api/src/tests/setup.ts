const { connect, closeDatabase, clearDatabase } = require('./dbHandler');

// Global lifecycle hooks shared across every test file.
beforeAll(async () => {
  await connect();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
