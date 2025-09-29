// ======================================================
// TASK MODEL
// ======================================================

const mongoose = require("mongoose");

/**
 * Schema for a Task document.
 * 
 * Fields:
 *   - title (string, required, max 50): task title
 *   - detail (string, optional, max 500): task details
 *   - date (string, default=current date yyyy-mm-dd): task date
 *   - time (string, default=current time hh:mm): task time
 *   - status (string, enum=["Por hacer","Haciendo","Hecho"], default="Por hacer"): task status
 *   - user (ObjectId, ref="User", required): reference to the user who created the task
 *   - createdAt (Date, default=now): document creation date
 */
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50,
  },
  detail: {
    type: String,
    maxlength: 500,
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split("T")[0], // yyyy-mm-dd
  },
  time: {
    type: String,
    default: () => new Date().toISOString().split("T")[1].substring(0,5), // hh:mm
  },
  status: {
    type: String,
    enum: ["Por hacer", "Haciendo", "Hecho"],
    default: "Por hacer",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// export Task model for use in controllers and routes
module.exports = mongoose.model("Task", TaskSchema);
