const express = require("express");
const router = express.Router();

// import user controller
const UserController = require("../controllers/UserController");

// import authentication middleware
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// USER SIGNUP
// ======================================================
/**
 * POST /users/signup
 * 
 * Registers a new user.
 * Body parameters:
 *   - firstName (string, required)
 *   - lastName (string, required)
 *   - age (number, required, min 13)
 *   - email (string, required, unique)
 *   - password (string, required, min 8, includes uppercase, lowercase, number, special character)
 *   - confirmPassword (string, required, must match password)
 * 
 * Response:
 *   - 201: user created successfully
 *   - 400: validation error
 *   - 409: email already registered
 *   - 500: server error
 */
router.post("/signup", UserController.signup);

// ======================================================
// GET ALL USERS
// ======================================================
/**
 * GET /users
 * 
 * Retrieves all users.
 * Excludes sensitive fields: password and __v.
 * Response:
 *   - 200: array of user objects
 *   - 500: server error
 */
router.get("/", UserController.getUsers);

// ======================================================
// UPDATE LOGGED-IN USER PROFILE
// ======================================================
/**
 * PUT /users/me
 * 
 * Updates profile of the authenticated user.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * Body parameters:
 *   - firstName (string, required)
 *   - lastName (string, required)
 *   - age (number, required, min 13)
 *   - email (string, required, unique)
 * 
 * Response:
 *   - 200: profile updated successfully
 *   - 400: validation error
 *   - 404: user not found
 *   - 500: server error
 */
router.put("/me", authMiddleware, UserController.updateProfile);

// ======================================================
// DELETE LOGGED-IN USER ACCOUNT
// ======================================================
/**
 * DELETE /users/me
 * 
 * Deletes the authenticated user's account along with all associated tasks.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * Body parameters:
 *   - password (string, required): confirm password
 *   - confirm (string, required, must be "ELIMINAR"): confirmation string
 * 
 * Response:
 *   - 204: account deleted successfully (no content)
 *   - 400/401: invalid confirmation or password
 *   - 404: user not found
 *   - 500: server error
 */
router.delete("/me", authMiddleware, UserController.deleteAccount);

// export router for use in main routes index
module.exports = router;
