// ======================================================
// MAIN API ROUTES
// ======================================================

const express = require("express");
const router = express.Router();

// ======================================================
// USER ROUTES
// ======================================================
// all routes starting with /users will use userRoutes
const userRoutes = require("./userRoutes");
router.use("/users", userRoutes);

/**
 * Example routes under /users:
 *   - GET /users         : get all users
 *   - PUT /users/me      : update profile of logged-in user
 *   - DELETE /users/me   : delete account of logged-in user
 */

// ======================================================
// AUTHENTICATION ROUTES
// ======================================================
// all routes starting with /auth will use authRoutes
const authRoutes = require("./authRoutes");
router.use("/auth", authRoutes);

/**
 * Example routes under /auth:
 *   - POST /auth/login           : login
 *   - POST /auth/logout          : logout
 *   - POST /auth/forgot-password : send reset link
 *   - POST /auth/reset-password/:token : reset password
 *   - GET /auth/me               : get profile of logged-in user
 */

// ======================================================
// TEST ROUTES
// ======================================================
// all routes starting with /test will use testRoutes
const testRoutes = require("./testRoutes");
router.use("/test", testRoutes);

// ======================================================
// TASK ROUTES
// ======================================================
// all routes starting with /tasks will use taskRoutes
const taskRoutes = require("./taskRoutes");
router.use("/tasks", taskRoutes);

/**
 * Example routes under /tasks:
 *   - POST /tasks           : create a new task
 *   - GET /tasks            : get tasks of logged-in user
 *   - GET /tasks/:id        : get task by id
 *   - PUT /tasks/:id        : update a task
 *   - DELETE /tasks/:id     : delete a task
 */

// export main router for use in app.js
module.exports = router;
