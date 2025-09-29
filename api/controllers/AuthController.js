// ======================================================
// AUTHENTICATION CONTROLLER
// ======================================================

// import user model for db queries
const User = require("../models/User");
// import jsonwebtoken to create/verify jwt tokens
const jwt = require("jsonwebtoken");
// randomUUID to generate unique token identifiers
const { randomUUID } = require("crypto");
// crypto to generate secure recovery tokens
const crypto = require("crypto");
// model for revoked tokens (logout)
const RevokedToken = require("../models/RevokedToken");
// bcrypt to hash and compare passwords
const bcrypt = require("bcrypt");

// email service
const { sendMail } = require("../services/emailService");

// ======================================================
// LOGIN
// ======================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate required fields
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // verify password using comparePassword method from model
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // generate unique identifier for jwt (jti)
    const jti = randomUUID();

    // generate jwt with 2h expiration time
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h", jwtid: jti }
    );

    // respond with success message and token
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Please try again later" });
  }
};

// ======================================================
// LOGOUT
// ======================================================
const logout = async (req, res) => {
  try {
    // extract token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    // save jti into revoked tokens collection with expiration
    if (decoded && decoded.jti && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await RevokedToken.create({ jti: decoded.jti, expiresAt });
    }

    res.status(200).json({ message: "Session closed successfully" });
  } catch (err) {
    console.error("logout error:", err.message);
    res.status(500).json({ message: "Logout error" });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // always return same response to prevent email leaks
      return res.status(202).json({ message: "If the email exists, you will receive a link" });
    }

    // generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // set expiration (1 hour)
    const resetPasswordExpires = Date.now() + 3600000;

    // save reset token and expiration in user record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    // build reset link using frontend url from .env
    const resetLink = `${process.env.FRONTEND_URL}/pages/resetp.html?token=${resetToken}`;

    // send email with reset link
    const previewUrl = await sendMail(
      user.email,
      "Password recovery",
      `<p>Click here to reset your password:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>The link expires in 1 hour.</p>`
    );

    res.json({
      message: "Check your email to continue",
      previewUrl,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Error in forgot password process" });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;   // token from url
    const { password } = req.body;  // new password from body

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    // find user with valid (not expired) token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // assign new password (hashing is handled in pre("save"))
    user.password = password;

    // clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // save updated user
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// ======================================================
// GET PROFILE OF LOGGED-IN USER
// ======================================================
const getProfile = async (req, res) => {
  try {
    // find user by id stored in req.userId (set by auth middleware)
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Error retrieving profile" });
  }
};

// ======================================================
// EXPORT FUNCTIONS
// ======================================================
module.exports = { login, logout, forgotPassword, resetPassword, getProfile };
