const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`MongoDB (Atlas) connected with server: ${data.connection.host}`);
    })
    .catch((err) => {
      console.error(`MongoDB connection failed: ${err.message}`);
      process.exit(1);
    });
};

module.exports = connectDatabase;

