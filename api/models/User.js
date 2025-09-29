// ======================================================
// USER MODEL
// ======================================================

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Schema for a User document.
 * 
 * Fields:
 *   - firstName (string, required, min 2, trimmed): user's first name
 *   - lastName (string, required, min 2, trimmed): user's last name
 *   - age (number, required, min 13): user's age
 *   - email (string, required, unique, lowercase, trimmed, regex validated): user's email
 *   - password (string, required, min 8, regex validated): password including uppercase, lowercase, number, special character
 * 
 *   - resetPasswordToken (string, optional, default=null): temporary token for password recovery
 *   - resetPasswordExpires (Date, optional, default=null): expiration date of reset token
 * 
 * Options:
 *   - timestamps: automatically add createdAt and updatedAt
 */

// define schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters long"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 2 characters long"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [13, "You must be at least 13 years old"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
            value
          );
        },
        message:
          "Password must include uppercase, lowercase, number and special character",
      },
    },
    // ======================================================
    // EXTRA FIELDS FOR PASSWORD RECOVERY
    // ======================================================
    resetPasswordToken: {
      type: String,
      default: null, // temporary token
    },
    resetPasswordExpires: {
      type: Date,
      default: null, // token expiration date
    },
  },
  { timestamps: true }
);

// ======================================================
// PASSWORD HASH BEFORE SAVE
// ======================================================
userSchema.pre("save", async function (next) {
  // only hash if password was modified
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ======================================================
// METHOD TO COMPARE PASSWORDS
// ======================================================
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ======================================================
// EXPORT MODEL
// ======================================================
const User = mongoose.model("User", userSchema);
module.exports = User;
