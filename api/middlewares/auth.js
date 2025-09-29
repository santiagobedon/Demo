// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

// import jsonwebtoken to verify JWT tokens
const jwt = require("jsonwebtoken");

/**
 * Middleware to protect routes by verifying JWT token.
 * 
 * req.cookies?.token (string, optional): token stored in cookies
 * req.headers.authorization (string, optional): Authorization header in format "Bearer <token>"
 * 
 * Adds:
 *   - req.user (object): decoded user information from token payload (e.g., { id, email })
 * 
 * Calls next() if token is valid.
 * Returns 401 Unauthorized if no token is provided or token is invalid/expired.
 */
const authMiddleware = (req, res, next) => {
  // get token from cookies or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    // respond with 401 if no token
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // verify token using secret key from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach decoded user info to request object
    req.user = decoded;

    // continue to next middleware or route handler
    next();
  } catch (err) {
    // token is invalid or expired
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// export middleware for use in protected routes
module.exports = authMiddleware;
