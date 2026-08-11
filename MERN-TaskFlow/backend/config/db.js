const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    // On Vercel serverless, log the error but do NOT throw.
    // Throwing would cause an unhandled promise rejection that crashes
    // the function. Let the app continue so health checks still work.
  }
};

module.exports = connectDB;