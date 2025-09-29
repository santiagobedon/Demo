const express = require("express");
const router = express.Router();

// import auth controllers
const { login, logout, forgotPassword, resetPassword, getProfile } = require("../controllers/AuthController");

// import authentication middleware
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// AUTHENTICATION ROUTES
// ======================================================

/**
 * POST /login
 * 
 * Logs in a user.
 * Body parameters:
 *   - email (string): user email
 *   - password (string): user password
 * 
 * Response:
 *   - 200: success message and JWT token
 *   - 400/401: invalid credentials
 */
router.post("/login", login);

/**
 * POST /logout
 * 
 * Logs out the authenticated user by revoking the JWT token.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * 
 * Response:
 *   - 200: session closed successfully
 *   - 401/403: unauthorized or invalid token
 */
router.post("/logout", authMiddleware, logout);

/**
 * POST /forgot-password
 * 
 * Sends a password reset link to the user's email if the email exists.
 * Body parameters:
 *   - email (string): user email
 * 
 * Response:
 *   - 202: email sent (or message shown regardless of existence for security)
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /reset-password/:token
 * 
 * Resets the user's password using a valid token.
 * URL parameters:
 *   - token (string): reset token from email
 * Body parameters:
 *   - password (string): new password
 * 
 * Response:
 *   - 200: password updated successfully
 *   - 400/403: invalid or expired token
 */
router.post("/reset-password/:token", resetPassword);

/**
 * GET /me
 * 
 * Retrieves the profile of the logged-in user.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * 
 * Response:
 *   - 200: user profile (excluding password)
 *   - 401/403: unauthorized or invalid token
 */
router.get("/me", authMiddleware, getProfile);

// export router for use in server
module.exports = router;
