// ======================================================
// MAIN SERVER (app.js)
// ======================================================

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { connectDB } = require("./config/database");
const routes = require("./routes/index"); // main router index.js

const app = express();

// ======================================================
// MIDDLEWARES
// ======================================================

// parse incoming JSON requests
app.use(express.json());

// parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

// ======================================================
// CORS CONFIGURATION
// ======================================================

// allowed origins for CORS
// replace these URLs with your frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
  "https://demoooo-six.vercel.app",
  "https://to-do-list-client-eight.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (e.g., Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The URL ${origin} is not allowed by CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // allow cookies if needed
}));

// ======================================================
// BASIC TEST ROUTE
// ======================================================
/**
 * GET /
 * 
 * Returns a simple message to verify the server is running.
 * Response:
 *   - 200: "Server is running"
 */
app.get("/", (req, res) => res.send("Server is running"));

// ======================================================
// API ROUTES
// ======================================================
/**
 * Prefix all routes with /api/v1
 * e.g., /api/v1/users, /api/v1/auth, /api/v1/tasks
 */
app.use("/api/v1", routes);

// ======================================================
// DATABASE CONNECTION
// ======================================================
connectDB(); // connect to MongoDB using connection string from .env

// ======================================================
// SERVER LISTEN PORT
// ======================================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// ======================================================
// EXPORT APP
// ======================================================
module.exports = app;
