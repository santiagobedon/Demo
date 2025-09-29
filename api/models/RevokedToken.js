// ======================================================
// REVOKED TOKEN MODEL (BLACKLIST)
// ======================================================

// import mongoose to define schema and model
const mongoose = require("mongoose");

/**
 * Schema for a revoked JWT token.
 * 
 * Fields:
 *   - jti (string, required, unique): unique identifier of the JWT (generated at login)
 *   - expiresAt (Date, required): expiration date of the original token
 * 
 * Options:
 *   - timestamps: automatically add createdAt and updatedAt fields
 */
const revokedTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true, // each jti appears only once in the blacklist
    },
    expiresAt: {
      type: Date,
      required: true, // token expiration date
    },
  },
  {
    timestamps: true, // auto add createdAt and updatedAt
  }
);

// ======================================================
// TTL INDEX (Time To Live)
// ======================================================
// Automatically deletes the document when "expiresAt" is reached
// Keeps the revoked tokens collection clean
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// create RevokedToken model based on schema
const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);

// export model for use in controllers and middleware
module.exports = RevokedToken;

