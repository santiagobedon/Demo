// ======================================================
// TASK CONTROLLER
// ======================================================

// import the Task model to interact with the database
const Task = require("../models/Task");

// ======================================================
// CREATE TASK
// ======================================================
/**
 * Creates a new task for the authenticated user.
 * 
 * req.body:
 *   - title (string, required): title of the task
 *   - detail (string, optional): additional details for the task
 *   - status (string, optional): current status of the task (default: "Por hacer")
 *   - date (string, required): due date in YYYY-MM-DD format
 *   - time (string, required): due time in HH:MM format
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 */
const createTask = async (req, res) => {
  try {
    const { title, detail, status, date, time } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ message: "Title, date, and time are required" });
    }

    const newTask = await Task.create({
      title,
      detail,
      date,
      time,
      status: status || "Por hacer",
      user: req.userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: newTask._id,
        title: newTask.title,
        detail: newTask.detail,
        date: newTask.date,
        time: newTask.time,
        status: newTask.status,
        user: newTask.user,
      },
    });
  } catch (err) {
    console.error("createTask error:", err.message);
    res.status(500).json({
      message: "Unable to save task, please try again",
      error: err.message,
    });
  }
};

// ======================================================
// GET ALL TASKS OF USER
// ======================================================
/**
 * Retrieves all tasks of the authenticated user.
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 * 
 * Returns:
 *   - message (string): status message
 *   - tasks (array): list of task objects
 */
const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).lean();

    res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (err) {
    console.error("getUserTasks error:", err.message);
    res.status(500).json({
      message: "Unable to retrieve tasks, please try again",
      error: err.message,
    });
  }
};

// ======================================================
// GET TASK BY ID
// ======================================================
/**
 * Retrieves a single task by ID for the authenticated user.
 * 
 * req.params:
 *   - id (string, required): task's unique identifier
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 * 
 * Returns:
 *   - task (object): task object if found
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (err) {
    console.error("getTaskById error:", err.message);
    res.status(500).json({
      message: "Error retrieving task",
      error: err.message,
    });
  }
};

// ======================================================
// UPDATE TASK
// ======================================================
/**
 * Updates an existing task by ID for the authenticated user.
 * 
 * req.params:
 *   - id (string, required): task's unique identifier
 * 
 * req.body:
 *   - title (string, required): new title of the task
 *   - detail (string, optional): updated details
 *   - date (string, optional): updated due date (must be today or future)
 *   - time (string, optional): updated due time
 *   - status (string, optional): updated status
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 * 
 * Returns:
 *   - message (string): status message
 *   - task (object): updated task object
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, detail, date, time, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (date) {
      const today = new Date().toISOString().split("T")[0];
      if (date < today) {
        return res.status(400).json({ message: "Date must be in the future" });
      }
    }

    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title;
    task.detail = detail;
    task.date = date || task.date;
    task.time = time || task.time;
    task.status = status || task.status;
    task.updatedAt = new Date().toISOString();

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task: {
        id: task._id,
        title: task.title,
        detail: task.detail,
        date: task.date,
        time: task.time,
        status: task.status,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    console.error("updateTask error:", err.message);
    res.status(500).json({
      message: "Unable to update task",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ======================================================
// DELETE TASK
// ======================================================
/**
 * Deletes a task by ID for the authenticated user.
 * 
 * req.params:
 *   - id (string, required): task's unique identifier
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 * 
 * Returns:
 *   - 204 No Content if task is deleted successfully
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Task no longer available" });
    }

    await task.deleteOne();

    return res.status(204).send();
  } catch (err) {
    console.error("deleteTask error:", err.message);
    return res.status(500).json({
      message: "Unable to delete task, please try later",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ======================================================
// EXPORT FUNCTIONS
// ======================================================
/**
 * Export all task controller functions to be used in routes
 */
module.exports = { createTask, getUserTasks, getTaskById, updateTask, deleteTask };
