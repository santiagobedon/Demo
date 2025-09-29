const express = require("express");
const router = express.Router();

// import authentication middleware
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// DASHBOARD / TEST
// ======================================================
/**
 * GET /test/dashboard
 * 
 * Returns a welcome message including the email of the authenticated user.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * 
 * Response:
 *   - 200: JSON object { message: "Hello, user email" }
 *   - 401/403: unauthorized or invalid token
 */
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Hello, ${req.user.email}` });
});

// export router for use in main routes index
module.exports = router;
