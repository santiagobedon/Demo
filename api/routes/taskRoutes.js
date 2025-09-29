const express = require("express");
const router = express.Router();

// import task controller
const TaskController = require("../controllers/TaskController");

// import authentication middleware
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// CREATE TASK
// ======================================================
/**
 * POST /tasks
 * 
 * Creates a new task for the authenticated user.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * Body parameters:
 *   - title (string, required)
 *   - detail (string, optional)
 *   - date (string, optional, format yyyy-mm-dd)
 *   - time (string, optional, format hh:mm)
 *   - status (string, optional, default "Por hacer")
 * 
 * Response:
 *   - 201: task created successfully
 *   - 400: missing required fields
 *   - 500: server error
 */
router.post("/", authMiddleware, TaskController.createTask);

// ======================================================
// GET TASKS OF AUTHENTICATED USER
// ======================================================
/**
 * GET /tasks/mytasks
 * 
 * Retrieves all tasks created by the authenticated user.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * 
 * Response:
 *   - 200: array of tasks
 *   - 500: server error
 */
router.get("/mytasks", authMiddleware, TaskController.getUserTasks);

// ======================================================
// UPDATE TASK
// ======================================================
/**
 * PUT /tasks/:id
 * 
 * Updates a specific task of the authenticated user.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * URL parameters:
 *   - id (string): task ID
 * Body parameters:
 *   - title (string, required)
 *   - detail (string, optional)
 *   - date (string, optional)
 *   - time (string, optional)
 *   - status (string, optional)
 * 
 * Response:
 *   - 200: task updated successfully
 *   - 400/404: validation or not found
 *   - 500: server error
 */
router.put("/:id", authMiddleware, TaskController.updateTask);

// ======================================================
// GET TASK BY ID
// ======================================================
/**
 * GET /tasks/:id
 * 
 * Retrieves a specific task of the authenticated user by ID.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * URL parameters:
 *   - id (string): task ID
 * 
 * Response:
 *   - 200: task object
 *   - 404: task not found
 *   - 500: server error
 */
router.get("/:id", authMiddleware, TaskController.getTaskById);

// ======================================================
// DELETE TASK BY ID
// ======================================================
/**
 * DELETE /tasks/:id
 * 
 * Deletes a specific task of the authenticated user by ID.
 * Middleware:
 *   - authMiddleware: ensures the user is authenticated
 * URL parameters:
 *   - id (string): task ID
 * 
 * Response:
 *   - 204: no content (successfully deleted)
 *   - 404: task not found
 *   - 500: server error
 */
router.delete("/:id", authMiddleware, TaskController.deleteTask);

// export router for use in main routes index
module.exports = router;
