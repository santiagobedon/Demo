// ======================================================
// USER CONTROLLER
// ======================================================

// import User and Task models to interact with the database
const User = require("../models/User");
const Task = require("../models/Task");
const bcrypt = require("bcrypt");

// ======================================================
// SIGNUP (REGISTER USER)
// ======================================================
/**
 * Registers a new user in the system.
 * 
 * req.body:
 *   - firstName (string, required): user's first name
 *   - lastName (string, required): user's last name
 *   - age (number, required): user's age (minimum 13)
 *   - email (string, required): user's email (must be unique)
 *   - password (string, required): user's password
 *   - confirmPassword (string, required): must match password
 * 
 * Returns:
 *   - id (string): newly created user's id
 *   - message (string): success message
 */
const signup = async (req, res) => {
  try {
    const { firstName, lastName, age, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !age || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (age < 13) {
      return res.status(400).json({ message: "Age must be at least 13" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const newUser = new User({ firstName, lastName, age, email, password });
    await newUser.save();

    res.status(201).json({ id: newUser._id, message: "User created successfully" });
  } catch (err) {
    console.error("signup error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    return res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// ======================================================
// GET ALL USERS
// ======================================================
/**
 * Retrieves all users from the database, excluding passwords and __v field.
 * 
 * Returns:
 *   - users (array): list of user objects without sensitive fields
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.status(200).json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ======================================================
// UPDATE PROFILE
// ======================================================
/**
 * Updates the profile of the authenticated user.
 * 
 * req.body:
 *   - firstName (string, required): updated first name
 *   - lastName (string, required): updated last name
 *   - age (number, required): updated age (minimum 13)
 *   - email (string, required): updated email (must be unique)
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 * 
 * Returns:
 *   - message (string): success message
 *   - updatedUser (object): updated user object (without password)
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, age, email } = req.body;

    if (!firstName || !lastName || !age || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (age < 13) {
      return res.status(400).json({ message: "Age must be at least 13" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, age, email },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser: {
        ...updatedUser.toObject(),
        updatedAt: updatedUser.updatedAt?.toISOString(),
      },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ======================================================
// DELETE ACCOUNT
// ======================================================
/**
 * Deletes the authenticated user account along with all their tasks.
 * 
 * req.body:
 *   - password (string, required): current password for verification
 *   - confirm (string, required): must be "ELIMINAR" to confirm deletion
 * 
 * req.userId (string): authenticated user's id (set by auth middleware)
 * 
 * Returns:
 *   - 204 No Content on success
 */
const deleteAccount = async (req, res) => {
  try {
    const { password, confirm } = req.body;

    if (confirm !== "ELIMINAR") {
      return res.status(400).json({ message: "You must type ELIMINAR to confirm" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await Task.deleteMany({ user: req.userId });
    await user.deleteOne();

    return res.status(204).send();
  } catch (err) {
    console.error("deleteAccount error:", err.message);
    return res.status(500).json({
      message: "Unable to delete account, please try later",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ======================================================
// EXPORT FUNCTIONS
// ======================================================
/**
 * Export all user controller functions to be used in routes
 */
module.exports = { signup, getUsers, updateProfile, deleteAccount };
