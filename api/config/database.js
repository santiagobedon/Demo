// ======================================================
// MONGODB CONNECTION CONFIGURATION
// ======================================================

const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Establish a connection to MongoDB using Mongoose.
 * 
 * - Reads the connection string from the .env file (MONGO_URI).
 * - If the environment variable is missing, throws an error.
 * - On success, logs a confirmation message.
 * - On failure, logs the error and stops the process.
 */
const connectDB = async () => {
  try {
    // connect using the URI defined in .env
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1); // stop the app if database connection fails
  }
};

/**
 * Disconnect from MongoDB.
 * 
 * - Closes the Mongoose connection gracefully.
 * - Logs a message when successfully disconnected.
 * - On failure, logs the error.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("🛑 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
  }
};

// Export the connection and disconnection functions
module.exports = { connectDB, disconnectDB };
