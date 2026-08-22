/**
 * MongoDB Atlas connection helper.
 *
 * The connection string is read from `process.env.MONGODB_URI` so that no
 * Atlas credentials are ever hardcoded in source. The connection is
 * established once, at application startup (see src/server.js).
 *
 * If the connection fails (e.g. an invalid/placeholder URI is configured),
 * the error is logged and the process keeps running. This deliberately does
 * NOT call `process.exit(1)` so the `GET /api/health` smoke endpoint stays
 * reachable while you wire up your real Atlas cluster. Once a valid
 * `MONGODB_URI` is provided, the connection succeeds and logs the host.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
