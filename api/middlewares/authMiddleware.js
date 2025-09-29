// ======================================================
// AUTHENTICATION MIDDLEWARE WITH TOKEN REVOCATION
// ======================================================

// import jsonwebtoken to verify JWT tokens
const jwt = require("jsonwebtoken");

// import RevokedToken model to check blacklist (revoked tokens)
const RevokedToken = require("../models/RevokedToken");

/**
 * Middleware to protect routes by verifying JWT token and checking if token is revoked.
 * 
 * req.headers.authorization (string, required): Authorization header in format "Bearer <token>"
 * 
 * Adds to req:
 *   - req.user (object): full decoded payload from token (e.g., { id, email, jti, ... })
 *   - req.userId (string): shortcut for user id
 * 
 * Behavior:
 *   - Returns 401 if no token is provided or token is revoked
 *   - Returns 403 if token is invalid or expired
 *   - Calls next() if token is valid and not revoked
 */
const authMiddleware = async (req, res, next) => {
  try {
    // get Authorization header
    const authHeader = req.headers["authorization"];

    // validate header format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    // extract token from header
    const token = authHeader.split(" ")[1];

    // verify token using secret key from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================================================
    // CHECK IF TOKEN HAS BEEN REVOKED (LOGOUT)
    // ======================================================
    if (decoded.jti) {
      const revoked = await RevokedToken.findOne({ jti: decoded.jti }).lean();
      if (revoked) {
        return res.status(401).json({ message: "Invalid token (revoked)" });
      }
    }

    // attach decoded info to request
    req.user = decoded;        // full decoded payload
    req.userId = decoded.id;   // shortcut for user id

    // continue to next middleware or route handler
    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// export middleware for protected routes
module.exports = authMiddleware;
