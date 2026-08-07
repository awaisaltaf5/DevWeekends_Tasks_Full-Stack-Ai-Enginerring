const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect mongoose to MongoDB for testing using an isolated in-memory MongoDB
 * instance. The `mongod` binary is downloaded and cached during `npm install`
 * (under node_modules/.cache/mongodb-memory-server), so no external database is
 * required and the tests never touch real data.
 *
 * The binary version is pinned to the cached `8.2.6` build so that the
 * already-downloaded binary is reused instead of re-resolving/downloading.
 */
const connect = async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '8.2.6' },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Stop the in-memory MongoDB instance and close the mongoose connection.
 */
const closeDatabase = async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
  await mongoose.connection.close();
};

/**
 * Remove every document from every collection in the in-memory database.
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };

