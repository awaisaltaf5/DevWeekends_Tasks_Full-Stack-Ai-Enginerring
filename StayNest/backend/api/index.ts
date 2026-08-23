const app = require('../src/app');
const connectDB = require('../src/config/db');

let databaseConnection;

module.exports = async (req, res) => {
  databaseConnection ??= connectDB();
  await databaseConnection;
  return app(req, res);
};
